import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ServerRequests } from '../../services/ServerRequests';

interface MenuItem {
  title: string;
  expanded?: boolean;
  children?: MenuItem[];
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  sideNav: MenuItem[] = [];
  isSidebarCollapsed = true;
  isDarkTheme = false;
  showProfileMenu = false;
  showNotification = false;

  profilename: string = '';
  profileImage: string = '';
  activeMenuTitle: string = '';
  userDesignation: any;
  greeting: string = '';
  userID: any;
  rolename: string = '';
  notifications: any[] = [];
  totalcount: any;
  designationId: any;

  private notificationInterval: any;

  constructor(private router: Router, private coreservices: ServerRequests) {
    const session = sessionStorage.getItem("Session");
    if (session) {
      try {
        const sessionDetails = JSON.parse(session);
        const data = sessionDetails.Data?.[0]; // Get the first record

        if (data) {
          this.userID = data.user_id;
          this.designationId = data.designation_id;
          this.profilename = data.fname + " " + data.lname;
          this.userDesignation = data.designation_name;

          if (this.userDesignation === "FIELD_OFFICER") {
            this.userDesignation = "Field Officer";
            this.rolename = "FO";
          } else if (this.userDesignation === "BEAT_OFFICER") {
            this.userDesignation = "Beat Officer";
            this.rolename = "BO";
          } else if (this.userDesignation === "RANGE_OFFICER") {
            this.userDesignation = "Range Officer";
            this.rolename = "RO";
          }
        }
      } catch (e) {
        console.error("Failed to parse session data", e);
      }
    }
  }

  ngOnInit(): void {
    this.loadRoleBasedMenu();
    this.setGreeting();
    this.getnotificationdetails();

    // Store interval reference to clear it on destroy and prevent memory leaks
    this.notificationInterval = setInterval(() => {
      this.getnotificationdetails();
    }, 5000);

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    } else {
      this.isDarkTheme = false;
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (this.userDesignation === "FOREST_MINISTER") {
      this.greeting = 'Welcome to the Honourable Minister';
    } else {
      if (hour < 12) {
        this.greeting = 'Good Morning';
      } else if (hour < 17) {
        this.greeting = 'Good Afternoon';
      } else if (hour < 21) {
        this.greeting = 'Good Evening';
      } else {
        this.greeting = 'Good Night';
      }
    }
  }

  loadRoleBasedMenu() {
    // FIXED: Initialize the full menu so we have something to filter against
    this.loadFullMenu();

    if (!this.designationId) {
      return;
    }

    this.coreservices.GetModulesByDesignation(this.designationId)
      .subscribe({
        next: (res: any) => {
          console.log('Permissions Response', res);
          if (!res?.Data?.length) {
            this.sideNav = [];
            return;
          }

          const normalize = (value: string) =>
            (value || '')
              .toLowerCase()
              .replace(/\s+/g, ' ')
              .trim();

          // Build a map from parent title -> allowed set (subs + childs)
          const allowedMap = new Map<string, Set<string>>();

          (res.Data || []).forEach((row: any) => {
            const parents = (row.parent_module || '')
              .split(',')
              .map((x: string) => normalize(x))
              .filter(Boolean);

            const subs = (row.sub_module || '')
              .split(',')
              .map((x: string) => normalize(x))
              .filter(Boolean);

            const childs = (row.child_module || '')
              .split(',')
              .map((x: string) => normalize(x))
              .filter(Boolean);

            parents.forEach((pr: string) => {
              if (!allowedMap.has(pr)) allowedMap.set(pr, new Set<string>());
              const set = allowedMap.get(pr)!;
              // if no subs/childs specified, treat as wildcard (allow parent itself)
              if (subs.length === 0 && childs.length === 0) {
                set.add('*');
              } else {
                subs.forEach((s: string) => set.add(s));
                childs.forEach((c: string) => set.add(c));
                // also allow the parent title explicitly if it's listed among subs/childs
                if (subs.includes(pr) || childs.includes(pr)) set.add(pr);
              }
            });
          });

          const filterNodesByAllowed = (nodes: MenuItem[] | undefined, allowedSet: Set<string>): MenuItem[] => {
            if (!nodes) return [];
            const out: MenuItem[] = [];
            for (const n of nodes) {
              const nTitle = normalize(n.title || '');
              // if wildcard or title explicitly allowed, include entire node
              if (allowedSet.has('*') || allowedSet.has(nTitle)) {
                out.push(n);
                continue;
              }

              // otherwise try filtering children
              if (n.children && n.children.length) {
                const filtered = filterNodesByAllowed(n.children, allowedSet);
                if (filtered.length) out.push({ ...n, children: filtered });
              }
            }
            return out;
          };

          // Filter top-level parents using allowedMap
          this.sideNav = this.sideNav.filter(parent => {
            const pTitle = normalize(parent.title || '');
            const allowedSet = allowedMap.get(pTitle);
            if (!allowedSet) return false;

            if (parent.children && parent.children.length) {
              parent.children = filterNodesByAllowed(parent.children, allowedSet);
              return parent.children.length > 0;
            }

            // no children: include if wildcard or parent explicitly allowed
            return allowedSet.has('*') || allowedSet.has(pTitle);
          });

          console.log('Filtered Menu', this.sideNav);
        },
        error: err => console.error(err)
      });
  }

  togglehamBurgerMenu() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleProfileMenu(e: Event) {
    e.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    this.activeMenuTitle = '';
  }

  closeAllMenus() {
    this.activeMenuTitle = '';
    this.showProfileMenu = false;
  }

  changePassword() {
    this.showProfileMenu = false;
  }

  logout() {

    const session = sessionStorage.getItem("Session");
    if (session) {
      const sessionDetails = JSON.parse(session);
      var username = sessionDetails.Data[0].user_name;
      this.userDesignation = sessionDetails.Data[0].designation_name;
    }
    this.coreservices.sessionlogout(username).subscribe({
      next: (res: any) => {
        sessionStorage.clear();
        localStorage.clear();

      },
      error: (err) => console.error("Error loading assets", err)
    });


    this.router.navigate(['/login']);
  }


  toggle(item: MenuItem, e?: Event) {
    if (e) e.stopPropagation();

    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
    }

    if (item.route) {
      this.router.navigate([item.route]);
      return;
    }

    if (item.children && item.children.length) {
      // Only close other menus if we are expanding a closed menu tree
      if (!item.expanded) {
        this.collapseOtherMenus(this.sideNav, item);
      }
      
      item.expanded = !item.expanded;
    }
  }

  /**
   * Closes sibling menu trees but safely avoids closing parent/ancestor chains
   */
  private collapseOtherMenus(menuList: MenuItem[], targetItem: MenuItem) {
    for (let item of menuList) {
      // If this item is NOT the target, and it is NOT an ancestor of the target, collapse it
      if (item !== targetItem && !this.isAncestorOf(item, targetItem)) {
        item.expanded = false;
      }

      // Continue scanning down nested children structures recursively
      if (item.children && item.children.length) {
        this.collapseOtherMenus(item.children, targetItem);
      }
    }
  }

  /**
   * Helper method to determine if a menu item contains the target deep inside its children
   */
  private isAncestorOf(parent: MenuItem, target: MenuItem): boolean {
    if (!parent.children || parent.children.length === 0) {
      return false;
    }

    // Check immediate children
    if (parent.children.includes(target)) {
      return true;
    }

    // Recursively check deeper levels
    for (let child of parent.children) {
      if (this.isAncestorOf(child, target)) {
        return true;
      }
    }

    return false;
  } 

  navigate(title: string) {
    switch (title) {
      case 'Home': this.router.navigate(['/home']); break;
      case 'Map': this.router.navigate(['/map']); break;
      case 'Inspection': this.router.navigate(['/inspection']); break;
      case 'Dashboard': this.router.navigate(['/capacity/dashboard']); break;
      case 'Proposed Capacity Development': this.router.navigate(['/capacity/proposed']); break;
      case 'Approved Capacity Development': this.router.navigate(['/capacity/approved']); break;
      case 'View Training Feedback': this.router.navigate(['/capacity/viewtraingFeedback']); break;
      case 'Department': this.router.navigate(['/capacity/training/department']); break;
      case 'Community': this.router.navigate(['/capacity/training/community']); break;
      case 'Stalls': this.router.navigate(['/capacity/market/stalls']); break;
      default: console.log('Nav to', title);
    }
  }

  private loadFullMenu() {
    if (this.userDesignation === "ADMIN") {
      this.sideNav = [
        { title: 'Admin', route: '/usermanagement' },
        { title: 'Upload', route: '/data-dump' },
        { title: 'Security-Role', route: '/role-access' }
      ]
    } else {
      this.sideNav = [
        { title: 'Dashboard', route: '/maindashboard' },
        { title: 'Map', route: '/map' },
        { title: 'Impact Assessment', route: '/Impactassessment' },
        { title: 'Home', route: '/home' },
        {title:'monitoring-dashboard',route:'/monitoring-dashboard'},
        {
          title: 'Capacity Development',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/capacity/dashboard' },
            { title: 'Proposed Capacity Development', route: '/capacity/proposed' },
            { title: 'Approved Capacity Development', route: '/capacity/approved' },
            { title: 'View Training Feedback', route: '/capacity/viewtraingFeedback' },
            {
              title: 'Training',
              expanded: false,
              children: [
                { title: 'Department', route: '/capacity/training/department' },
                { title: 'Community', route: '/capacity/training/community' }
              ]
            },
            {
              title: 'Market & Outreach',
              expanded: false,
              children: [
                { title: 'Stalls', route: '/capacity/market/stalls' }
              ]
            }
          ]
        },
        {
          title: 'JFMC and EDC',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/jfmc/dashboard' },
            {
              title: 'Planning',
              expanded: false,
              children: [
                { title: 'JFMC Selection', route: '/jfmc/planning/selection' },
                { title: 'Micro Planning', route: '/jfmc/planning/micro-planning' }
              ]
            },
            { title: 'JFMC Data Entry', route: '/jfmc/data-entry' },
            { title: 'Meeting', route: '/jfmc/meeting' },
            { title: 'Check list of JFMC book record', route: '/jfmc/book-record' },
            { title: 'Monitoring', route: '/jfmc/monitoring' }
          ]
        },
        {
          title: 'SHG and JLG',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/shg/dashboard' },
            { title: 'Shg-JLG Data Entry', route: '/shg/shg-dataEntry' },
            { title: 'Panchasutra', route: '/shg/panchasutra' },
            { title: 'Business Plan', route: '/shg/Businessplan' },
            { title: 'Credit Linkage', route: '/shg/Creditlinkage' },
            { title: 'Loan Recovery', route: '/shg/LoanRecovery' }
          ]
        },
        {
          title: 'Forest Management',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/forest-management/dashboard' },
            {
              title: 'Nursery',
              expanded: false,
              children: [
                { title: 'Nursery Details', route: '/forest-management/nurserydetails' },
                { title: 'InfraStructure', route: '/forest-management/infrastructure' },
                { title: 'Infrastructure  Cost', route: '/forest-management/infrastructurecost' },
                { title: 'Seedlings or Saplings Raised', route: '/forest-management/seedingandsapling' },
                { title: 'stock position', route: '/forest-management/stockposition' },
              ]
            },
            {
              title: 'plantation',
              expanded: false,
              children: [
                { title: 'Pre Survey', route: '/forest-management/presurvey' },
                { title: 'Site Master', route: '/forest-management/sitemaster' },
                { title: 'Advance Work', route: '/forest-management/advancework' },
                { title: 'Plantation', route: '/forest-management/plantation' },
                { title: 'Re survey', route: '/forest-management/resurvey' },
                { title: 'Maintenance', route: '/forest-management/maintence' },
              ]
            },
            {
              title: 'Eco Development',
              expanded: false,
              children: [
                { title: 'Dashboard', route: '/forest-management/eco-development/dashboard' },
                {
                  title: 'Plantation',
                  expanded: false,
                  children: [
                    { title: 'Ecodevelopment Pre Survey', route: '/forest-management/ecodevelopmentpresurvey' },
                    { title: 'Ecodevelopment Site Master', route: '/forest-management/ecodevelopmentsitemaster' },
                    { title: 'Ecodevelopment Advance Work', route: '/forest-management/ecodevelopmentAdvanceworkComponent' },
                    { title: 'Ecodevelopment  Plantation', route: '/forest-management/ecoplantationComponent' },
                    { title: 'Ecodevelopment  Re survey', route: '/forest-management/ecoresurveyComponent' },
                    { title: 'Ecodevelopment  Maintenence', route: '/forest-management/ecomaintenenceComponent' },
                  ]
                },
                {
                  title: 'SMC',
                  expanded: false,
                  children: [
                    { title: 'SMC Basic Details', route: '/forest-management/smcbasicdetails' },
                    { title: 'SMC Technical Details', route: '/forest-management/smctechnicaldetails' },
                    { title: 'SMC Implementation Details', route: '/forest-management/smcImplementationdetails' },
                    { title: 'SMC Montoring Details', route: '/forest-management/smcMontoring' },
                    { title: 'SMC Asset Updation', route: '/forest-management/smcAssetUpdation' },
                  ]
                },
                {
                  title: 'Protection',
                  expanded: false,
                  children: [
                    { title: 'Creation', route: '/forest-management/protectionCreation' },
                    { title: 'Montoring', route: '/forest-management/protectionMontroing' },
                    { title: 'Live Imunization', route: '/forest-management/protectionLiveImunization' },
                  ]
                },
              ]
            }
          ]
        },
        {
          title: 'Livelihood',
          expanded: false,
          children: [
            { title: 'Dashboard', route: 'livelihood/dashboard' },
            {
              title: 'Eco Tourism',
              expanded: false,
              children: [
                { title: 'Site Selection', route: '/livelihood/eco/site-selection' },
                { title: 'Homestay Site Selection', route: '/livelihood/eco/homestay' },
                { title: 'Facilities', route: '/livelihood/eco/facilities' },
                { title: 'Creation', route: '/livelihood/eco/creation' },
                { title: 'Institutional Framework', route: '/livelihood/eco/institution' },
                { title: 'Monitoring', route: '/livelihood/eco/monitoring' }
              ]
            },
            {
              title: 'Agro Forestry',
              expanded: false,
              children: [
                { title: 'Survey', route: '/livelihood/agro/survey' },
                { title: 'Field Details', route: '/livelihood/agro/field-details' },
                { title: 'Plantation Creation', route: '/livelihood/agro/plantation-creation' },
                { title: 'Resurvey', route: '/livelihood/agro/resurvey' },
                { title: 'Production', route: '/livelihood/agro/production' },
                { title: 'Maintenance', route: '/livelihood/agro/maintenance' },
              ]
            },
            {
              title: 'Livestock',
              expanded: false,
              children: [
                { title: 'Planning', route: '/livelihood/livestock/planning' },
                { title: 'Livestock', route: '/livelihood/livestock/main' },
                { title: 'Stock Position', route: '/livelihood/livestock/stock' },
                { title: 'Monitoring', route: '/livelihood/livestock/monitoring' }
              ]
            },
            {
              title: 'Fisheries',
              expanded: false,
              children: [
                { title: 'Planning', route: '/livelihood/fisheries/planning' },
                { title: 'Check Dam Details', route: '/livelihood/fisheries/checkdam' },
                { title: 'Species Details', route: '/livelihood/fisheries/species' },
                { title: 'Target Details', route: '/livelihood/fisheries/target' },
                { title: 'Production Details', route: '/livelihood/fisheries/production' }
              ]
            },
            {
              title: 'NTFP Based',
              expanded: false,
              children: [
                { title: 'Planning', route: '/livelihood/ntfp/planning' },
                { title: 'Creation', route: '/livelihood/ntfp/creation' },
                { title: 'Harvesting', route: '/livelihood/ntfp/harvesting' },
                { title: 'Production', route: '/livelihood/ntfp/production' }
              ]
            }
          ]
        },
        {
          title: 'Catchment Area Management',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/catchment-dashboard' },
            {
              title: 'SMC',
              expanded: false,
              children: [
                { title: 'Planning', route: '/catchment/smc/planning' },
                { title: 'Catchment Basic Details', route: 'catchment/smc/catchmentbasicdetails' },
                { title: 'Technical Details', route: '/catchment/smc/technical-details' },
                { title: 'Implementation', route: '/catchment/smc/implementation' },
                { title: 'Monitoring', route: '/catchment/smc/catchmentmonitoring' },
                { title: 'Asset Updation', route: '/catchment/smc/asset-updation' }
              ]
            },
            {
              title: 'Water Shed Management',
              expanded: false,
              children: [
                { title: 'SMC Site Suitability', route: '/catchment/watershed/site-suitability' }
              ]
            },
            {
              title: 'Water table and Rainfall Data',
              expanded: false,
              children: [
                { title: 'Treatment Area', route: '/catchment/watertable/treatment-area' },
                { title: 'Tube Wells', route: '/catchment/watertable/tube-wells' },
                { title: 'Weather Data', route: '/catchment/watertable/weather-data' }
              ]
            }
          ]
        },
        {
          title: 'NTFP(NCE)',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/ntfp/dashboard' },
            { title: 'Creation of CCFC Center', route: '/ntfp/ccfc-center' },
            { title: 'Creation of Craft & More Outlets', route: '/ntfp/craft-outlets' },
            {
              title: 'Collection/Processing Center',
              expanded: false,
              children: [
                { title: 'Details NTFP Collection', route: '/ntfp/collection/details' },
                { title: 'Processing & Quality Control', route: '/ntfp/collection/processing' },
                { title: 'Marketing & Stalls', route: '/ntfp/collection/stalls' }
              ]
            },
            {
              title: 'Resource Assessment & Inventory',
              expanded: false,
              children: [
                { title: 'Survey', route: '/ntfp/resource/survey' },
                { title: 'Resource Harvesting', route: '/ntfp/resource/harvesting' },
                { title: 'Resource Generation & Growth', route: '/ntfp/resource/growth' }
              ]
            },
            { title: 'Craft & More Outlets Monitor', route: '/ntfp/outlets-monitor' },
            { title: 'Exhibition & Fair', route: '/ntfp/exhibition-fair' }
          ]
        },
        {
          title: 'Project Management',
          expanded: false,
          children: [
            { title: 'Dashboard', route: '/project-management/dashboard' },
            { title: 'Asset Creation', route: '/project-management/asset-creation' },
            { title: 'Asset Maintenence', route: '/project-management/asset-maintenance' },
            { title: 'Attendence Report', route: '/project-management/attendance-report' },
          ]
        }
      ];
    }
  }

  getIcon(title: string): string {
    const icons: { [key: string]: string } = {
      'Home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'Map': 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      'Inspection': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      'Dashboard': 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', 
      'Monitoring Dashboard': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z', 
      'Impact Assessment': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'Impactassessment': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', 
      'Capacity Development': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      'JFMC and EDC': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'SHG and JLG': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
      'Forest Management': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      'Livelihood': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255zM12 8a1 1 0 100-2 1 1 0 000 2z',
      'Catchment Area Management': 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5',
      'NTFP(NCE)': 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z',
      'Project Management': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    };
    return icons[title] || 'M12 6v6m0 0v6m0-6h6m-6 0H6';
  }

  toggleNotification(event: Event) {
    event.stopPropagation();
    this.showNotification = !this.showNotification;
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.showNotification = false;
    this.showProfileMenu = false;
  }

  getnotificationdetails() {
    this.coreservices.getNotificationlist(this.userID, this.rolename).subscribe({
      next: res => {
        let response = (res?.Data || [])
          .filter((c: any) => c.pending_count > 0)
          .map((item: any, index: number) => ({
            sno: index + 1,
            ...item
          }));
        this.notifications = response;
        this.totalcount = this.notifications.reduce((sum, n) => sum + n.pending_count, 0);
      },
      error: err => console.error('Grid Data Error:', err)
    });
  }

  openNotification(note: any) {
    if (!note) {
      return;
    }

    const route = this.findRouteByTitle(
      this.sideNav,
      note.child_module || note.sub_module || note.main_module
    );

    if (route) {
      this.router.navigate([route]);
    } else {
      console.warn('Route not found', note);
    }
  }

  private findRouteByTitle(menus: MenuItem[], title: string): string | null {
    const search = title?.toLowerCase().trim();

    for (const menu of menus) {
      if (menu.title?.toLowerCase().trim() === search && menu.route) {
        return menu.route;
      }
      if (menu.children?.length) {
        const route = this.findRouteByTitle(menu.children, title);
        if (route) {
          return route;
        }
      }
    }
    return null;
  }

  findRouteFromMenu(menu: any[], main: string, sub: string, child: string) {
    const mainLower = main?.toLowerCase() || '';
    const subLower = sub?.toLowerCase() || '';
    const childLower = child?.toLowerCase() || '';

    // Capacity Development - Special Routes
    if (mainLower.includes('capacity')) {
      if (subLower.includes('proposed')) { this.router.navigate(['/capacity/viewproposeddetails']); return null; }
      if (subLower.includes('approved')) { this.router.navigate(['/capacity/viewapproveddetails']); return null; }
      if (subLower.includes('training') && childLower.includes('view')) { this.router.navigate(['/capacity/viewtrainingdetails']); return null; }
    }

    // JFMC and EDC - Special Routes
    if (mainLower.includes('jfmc')) {
      if (subLower.includes('planning') && childLower.includes('selection')) { this.router.navigate(['/jfmc/planning/selection']); return null; }
      if (subLower.includes('planning') && childLower.includes('micro')) { this.router.navigate(['/jfmc/planning/micro-planning']); return null; }
      if (subLower.includes('data entry') && childLower.includes('view')) { this.router.navigate(['/jfmc/data-entry']); return null; }
      if (subLower.includes('meeting') && childLower.includes('view')) { this.router.navigate(['/jfmc/meeting']); return null; }
    }

    // SHG and JLG - Special Routes
    if (mainLower.includes('shg')) {
      if (subLower.includes('data entry')) { this.router.navigate(['/shg/shg-dataEntry']); return null; }
      if (subLower.includes('panchasutra')) { this.router.navigate(['/shg/panchasutra']); return null; }
      if (subLower.includes('business')) { this.router.navigate(['/shg/Businessplan']); return null; }
      if (subLower.includes('credit')) { this.router.navigate(['/shg/Creditlinkage']); return null; }
      if (subLower.includes('loan')) { this.router.navigate(['/shg/LoanRecovery']); return null; }
    }

    // Forest Management - Special Routes
    if (mainLower.includes('forest')) {
      if (subLower.includes('nursery')) {
        if (childLower.includes('basic')) { this.router.navigate(['/forest-management/nurserydetails']); return null; }
        if (childLower.includes('infrastructure') && !childLower.includes('cost')) { this.router.navigate(['/forest-management/infrastructure']); return null; }
        if (childLower.includes('cost')) { this.router.navigate(['/forest-management/infrastructurecost']); return null; }
        if (childLower.includes('seedling') || childLower.includes('sapling')) { this.router.navigate(['/forest-management/seedingandsapling']); return null; }
        if (childLower.includes('stock')) { this.router.navigate(['/forest-management/stockposition']); return null; }
      }
      if (subLower.includes('plantation')) {
        if (childLower.includes('pre survey') || childLower.includes('presurvey')) { this.router.navigate(['/forest-management/presurvey']); return null; }
        if (childLower.includes('site master')) { this.router.navigate(['/forest-management/sitemaster']); return null; }
        if (childLower.includes('advance')) { this.router.navigate(['/forest-management/advancework']); return null; }
        if (childLower.includes('plantation') && !childLower.includes('eco')) { this.router.navigate(['/forest-management/plantation']); return null; }
        if (childLower.includes('resurvey') || childLower.includes('re survey')) { this.router.navigate(['/forest-management/resurvey']); return null; }
        if (childLower.includes('maintence') || childLower.includes('maintenance')) { this.router.navigate(['/forest-management/maintence']); return null; }
      }
      if (subLower.includes('eco development')) {
        if (childLower.includes('ecodevelopment pre')) { this.router.navigate(['/forest-management/ecodevelopmentpresurvey']); return null; }
        if (childLower.includes('ecodevelopment site')) { this.router.navigate(['/forest-management/ecodevelopmentsitemaster']); return null; }
        if (childLower.includes('ecodevelopment advance')) { this.router.navigate(['/forest-management/ecodevelopmentAdvanceworkComponent']); return null; }
        if (childLower.includes('ecodevelopment') && childLower.includes('plantation')) { this.router.navigate(['/forest-management/ecoplantationComponent']); return null; }
        if (childLower.includes('ecodevelopment') && childLower.includes('resurvey')) { this.router.navigate(['/forest-management/ecoresurveyComponent']); return null; }
        if (childLower.includes('ecodevelopment') && childLower.includes('maintence')) { this.router.navigate(['/forest-management/ecomaintenenceComponent']); return null; }
        if (childLower.includes('smc basic')) { this.router.navigate(['/forest-management/smcbasicdetails']); return null; }
        if (childLower.includes('smc technical')) { this.router.navigate(['/forest-management/smctechnicaldetails']); return null; }
        if (childLower.includes('smc implementation')) { this.router.navigate(['/forest-management/smcImplementationdetails']); return null; }
        if (childLower.includes('smc montoring')) { this.router.navigate(['/forest-management/smcMontoring']); return null; }
        if (childLower.includes('smc asset')) { this.router.navigate(['/forest-management/smcAssetUpdation']); return null; }
        if (childLower.includes('protection creation')) { this.router.navigate(['/forest-management/protectionCreation']); return null; }
        if (childLower.includes('protection montoring')) { this.router.navigate(['/forest-management/protectionMontroing']); return null; }
        if (childLower.includes('live imunization')) { this.router.navigate(['/forest-management/protectionLiveImunization']); return null; }
      }
    }

    // Livelihood - Special Routes
    if (mainLower.includes('livelihood')) {
      if (subLower.includes('eco tourism')) {
        if (childLower.includes('site selection')) { this.router.navigate(['/livelihood/eco/site-selection']); return null; }
        if (childLower.includes('homestay')) { this.router.navigate(['/livelihood/eco/homestay']); return null; }
        if (childLower.includes('facilities')) { this.router.navigate(['/livelihood/eco/facilities']); return null; }
        if (childLower.includes('creation')) { this.router.navigate(['/livelihood/eco/creation']); return null; }
        if (childLower.includes('institutional')) { this.router.navigate(['/livelihood/eco/institution']); return null; }
        if (childLower.includes('monitoring')) { this.router.navigate(['/livelihood/eco/monitoring']); return null; }
      }
      if (subLower.includes('agro')) {
        if (childLower.includes('survey')) { this.router.navigate(['/livelihood/agro/survey']); return null; }
        if (childLower.includes('field')) { this.router.navigate(['/livelihood/agro/field-details']); return null; }
        if (childLower.includes('plantation')) { this.router.navigate(['/livelihood/agro/plantation-creation']); return null; }
        if (childLower.includes('resurvey')) { this.router.navigate(['/livelihood/agro/resurvey']); return null; }
        if (childLower.includes('production')) { this.router.navigate(['/livelihood/agro/production']); return null; }
        if (childLower.includes('maintenance')) { this.router.navigate(['/livelihood/agro/maintenance']); return null; }
      }
      if (subLower.includes('livestock')) {
        if (childLower.includes('planning')) { this.router.navigate(['/livelihood/livestock/planning']); return null; }
        if (childLower.includes('livestock')) { this.router.navigate(['/livelihood/livestock/main']); return null; }
        if (childLower.includes('stock')) { this.router.navigate(['/livelihood/livestock/stock']); return null; }
        if (childLower.includes('monitoring')) { this.router.navigate(['/livelihood/livestock/monitoring']); return null; }
      }
      if (subLower.includes('fisheries')) {
        if (childLower.includes('planning')) { this.router.navigate(['/livelihood/fisheries/planning']); return null; }
        if (childLower.includes('check dam')) { this.router.navigate(['/livelihood/fisheries/checkdam']); return null; }
        if (childLower.includes('species')) { this.router.navigate(['/livelihood/fisheries/species']); return null; }
        if (childLower.includes('target')) { this.router.navigate(['/livelihood/fisheries/target']); return null; }
        if (childLower.includes('production')) { this.router.navigate(['/livelihood/fisheries/production']); return null; }
      }
      if (subLower.includes('ntfp')) {
        if (childLower.includes('planning')) { this.router.navigate(['/livelihood/ntfp/planning']); return null; }
        if (childLower.includes('creation')) { this.router.navigate(['/livelihood/ntfp/creation']); return null; }
        if (childLower.includes('harvesting')) { this.router.navigate(['/livelihood/ntfp/harvesting']); return null; }
        if (childLower.includes('production')) { this.router.navigate(['/livelihood/ntfp/production']); return null; }
      }
    }

    // Catchment Area Management - Special Routes
    if (mainLower.includes('catchment')) {
      if (subLower.includes('upload')) { this.router.navigate(['catchment/data-dump']); return null; }
      if (subLower.includes('dashboard')) { this.router.navigate(['/catchment-dashboard']); return null; }
      if (subLower.includes('smc')) {
        if (childLower.includes('planning')) { this.router.navigate(['/catchment/smc/planning']); return null; }
        if (childLower.includes('catchment basic')) { this.router.navigate(['catchment/smc/catchmentbasicdetails']); return null; }
        if (childLower.includes('technical')) { this.router.navigate(['/catchment/smc/technical-details']); return null; }
        if (childLower.includes('implementation')) { this.router.navigate(['/catchment/smc/implementation']); return null; }
        if (childLower.includes('monitoring')) { this.router.navigate(['/catchment/smc/catchmentmonitoring']); return null; }
        if (childLower.includes('asset')) { this.router.navigate(['/catchment/smc/asset-updation']); return null; }
      }
      if (subLower.includes('watershed')) {
        if (childLower.includes('smc site')) { this.router.navigate(['/catchment/watershed/site-suitability']); return null; }
      }
      if (subLower.includes('water table') || subLower.includes('rainfall')) {
        if (childLower.includes('treatment')) { this.router.navigate(['/catchment/watertable/treatment-area']); return null; }
        if (childLower.includes('tube')) { this.router.navigate(['/catchment/watertable/tube-wells']); return null; }
        if (childLower.includes('weather')) { this.router.navigate(['/catchment/watertable/weather-data']); return null; }
      }
    }

    // NTFP(NCE) - Special Routes
    if (mainLower.includes('ntfp')) {
      if (subLower.includes('dashboard')) { this.router.navigate(['/ntfp/dashboard']); return null; }
      if (subLower.includes('ccfc')) { this.router.navigate(['/ntfp/ccfc-center']); return null; }
      if (subLower.includes('craft') && subLower.includes('outlet') && !subLower.includes('monitor')) { this.router.navigate(['/ntfp/craft-outlets']); return null; }
      if (subLower.includes('collection')) {
        if (childLower.includes('details')) { this.router.navigate(['/ntfp/collection/details']); return null; }
        if (childLower.includes('processing')) { this.router.navigate(['/ntfp/collection/processing']); return null; }
        if (childLower.includes('marketing') || childLower.includes('stalls')) { this.router.navigate(['/ntfp/collection/stalls']); return null; }
      }
      if (subLower.includes('resource')) {
        if (childLower.includes('survey')) { this.router.navigate(['/ntfp/resource/survey']); return null; }
        if (childLower.includes('harvesting')) { this.router.navigate(['/ntfp/resource/harvesting']); return null; }
        if (childLower.includes('growth') || childLower.includes('generation')) { this.router.navigate(['/ntfp/resource/growth']); return null; }
      }
      if (subLower.includes('monitor')) { this.router.navigate(['/ntfp/outlets-monitor']); return null; }
      if (subLower.includes('exhibition')) { this.router.navigate(['/ntfp/exhibition-fair']); return null; }
    }

    // Project Management - Special Routes
    if (mainLower.includes('project')) {
      if (subLower.includes('dashboard')) { this.router.navigate(['/project-management/dashboard']); return null; }
      if (subLower.includes('asset creation')) { this.router.navigate(['/project-management/asset-creation']); return null; }
      if (subLower.includes('asset maintenence') || subLower.includes('asset maintenance')) { this.router.navigate(['/project-management/asset-maintenance']); return null; }
      if (subLower.includes('apo')) { this.router.navigate(['/project-management/apo']); return null; }
    }

    // Fallback: Generic route lookup from menu structure
    for (let item of menu) {
      if (item.title?.toLowerCase() === mainLower && item.children) {
        for (let subItem of item.children) {
          if (subItem.title?.toLowerCase() === subLower && subItem.children) {
            for (let childItem of subItem.children) {
              if (childItem.title?.toLowerCase() === childLower && childItem.route) {
                return childItem.route;
              }
              if (childItem.children) {
                const route = this.findRouteInChildren(childItem.children, childLower);
                if (route) return route;
              }
            }
          } else if (subItem.title?.toLowerCase() === subLower && subItem.route) {
            return subItem.route;
          }
        }
        if (item.route) return item.route;
      }
    }
    return null;
  }

  private findRouteInChildren(children: MenuItem[], targetTitle: string): string | null {
    for (const item of children) {
      if (item.title?.toLowerCase().trim() === targetTitle?.toLowerCase().trim()) {
        return item.route || null;
      }
      if (item.children?.length) {
        const route = this.findRouteInChildren(item.children, targetTitle);
        if (route) {
          return route;
        }
      }
    }
    return null;
  }

  markAllRead() {
    // this.notifications.forEach(n => n.read = true);
  }
}