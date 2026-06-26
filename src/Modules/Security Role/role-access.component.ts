import { Component, OnInit } from '@angular/core';
import { ServerRequests } from '../../services/ServerRequests';

interface MenuNode {
  title: string;
  route?: string;
  expanded?: boolean;
  children?: MenuNode[];
}

interface AccessNode {
  id: string;
  title: string;
  checked: boolean;
  expanded?: boolean;
  route?: string;
  children?: AccessNode[];
}

@Component({
  selector: 'app-role-access',
  templateUrl: './role-access.component.html',
  styleUrls: ['./role-access.component.css']
})
export class RoleAccessComponent implements OnInit {
  userDesignations: any[] = [];
  selectedDesignation: any = '';
  selectedLanding: string = '';
  landingOptions: { label: string; route: string }[] = [];
  saveMessage = '';
  saveSuccess: boolean | null = null;
  saving = false;

 

  private menuItems: MenuNode[] = [
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
            { title: 'stock position', route: '/forest-management/stockposition' }
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
            { title: 'Maintence', route: '/forest-management/maintence' }
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
                { title: 'Ecodevelopment  Maintenence', route: '/forest-management/ecomaintenenceComponent' }
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
                { title: 'SMC Asset Updation', route: '/forest-management/smcAssetUpdation' }
              ]
            },
            {
              title: 'Protection',
              expanded: false,
              children: [
                { title: 'Creation', route: '/forest-management/protectionCreation' },
                { title: 'Montoring', route: '/forest-management/protectionMontroing' },
                { title: 'Live Imunization', route: '/forest-management/protectionLiveImunization' }
              ]
            }
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
            { title: 'Maintenance', route: '/livelihood/agro/maintenance' }
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

   accessTree: AccessNode[] = this.buildAccessTree(this.menuItems);
  constructor(private coreservices: ServerRequests) {}

  ngOnInit(): void {
    this.getLookups();
    this.landingOptions = this.flattenMenuForLanding(this.menuItems);
  }

  onDesignationChange(): void {
    if (!this.selectedDesignation) {
      this.selectedLanding = '';
      return;
    }

    const stored = localStorage.getItem(`designationLanding_${this.selectedDesignation}`);
    this.selectedLanding = stored || '';
  }

  toggleExpand(node: AccessNode): void {
    if (this.hasChildren(node)) {
      node.expanded = !node.expanded;
    }
  }

  toggleNode(event: Event, node: AccessNode): void {
    const input = event.target as HTMLInputElement;
    this.setNodeChecked(node, input.checked);
  }

  isIndeterminate(node: AccessNode): boolean {
    if (!this.hasChildren(node)) {
      return false;
    }

    const children = node.children || [];
    const selectedChildren = children.filter(child => child.checked || this.isIndeterminate(child));

    return selectedChildren.length > 0 && selectedChildren.length < children.length;
  }

  hasChildren(node: AccessNode): boolean {
    return !!node.children && node.children.length > 0;
  }

  getSelectedCount(): number {
    return this.getSelectedLeafNodes().length;
  }

saveAccess(): void {
  if (!this.selectedDesignation) {
    this.saveSuccess = false;
    this.saveMessage = 'Please select a designation before saving.';
    return;
  }

  this.saving = true;
  this.saveMessage = '';
  this.saveSuccess = null;

  const selectedPaths = this.getSelectedLeafNodes()
    .map(node => this.findPath(this.accessTree, node.id))
    .filter((path): path is AccessNode[] => !!path);

  const parentModules = new Set<string>();
  const subModules = new Set<string>();
  const childModules = new Set<string>();

  selectedPaths.forEach(path => {
    const parentNode = path[0];
    const childNode = path[path.length - 1];
    const subModule = path.length > 2
      ? path.slice(1, path.length - 1).map(node => node.title).join(' > ')
      : childNode.title;

    parentModules.add(parentNode.title);
    subModules.add(subModule);
    childModules.add(childNode.title);
  });

  // 1. Package the dataset into a single JSON object matching your C# DTO keys
  const accessPayload = {
    ParentModule: parentModules.size > 0 ? Array.from(parentModules).join(',') : '',
    Submodule: subModules.size > 0 ? Array.from(subModules).join(',') : '',
    ChildModule: childModules.size > 0 ? Array.from(childModules).join(',') : '',
    designation_id: Number(this.selectedDesignation),
    landingpage: this.selectedLanding || ''
  };

  // 2. Send the payload block object to your backend endpoint service
  this.coreservices.insertSecurityUsers(accessPayload).subscribe({
    next: (res: any) => {
      this.saving = false;
      this.saveSuccess = true;
      this.saveMessage = res?.message || 'Saved successfully';
      console.log('Saved successfully', res);

      // auto-clear message after 4 seconds
      setTimeout(() => { this.saveMessage = ''; this.saveSuccess = null; }, 4000);
    },
    error: (err: any) => {
      this.saving = false;
      this.saveSuccess = false;
      this.saveMessage = 'Save failed. Please try again.';
      console.error('Save failed', err);

      setTimeout(() => { this.saveMessage = ''; this.saveSuccess = null; }, 6000);
    }
  });
}

  getLookups(): void {
    this.coreservices.GetUserLookup().subscribe({
      next: (res: any) => {
        let lookupData = res?.Data;
        if (typeof lookupData === 'string') {
          lookupData = JSON.parse(lookupData);
        }

        if (!lookupData || !lookupData['designation_master']) {
          return;
        }

        this.userDesignations = lookupData['designation_master']
          .filter((d: any) => d.status === 'active')
          .map((item: any) => ({
            name: item.display_name,
            value: item.designation_id
          }));
      },
      error: (err: any) => console.error('Lookup error', err)
    });
  }

  saveLanding(): void {
    if (!this.selectedDesignation) {
      this.saveSuccess = false;
      this.saveMessage = 'Please select a designation before saving landing module.';
      return;
    }

    try {
      localStorage.setItem(`designationLanding_${this.selectedDesignation}`, this.selectedLanding || '');
      // Also persist landing to backend so login can redirect based on server value
      this.coreservices.InsertSecurityusers('', '', '', Number(this.selectedDesignation), this.selectedLanding || '').subscribe({
        next: () => {
          // no-op; server persisted
        },
        error: (e) => console.error('Persist landing failed', e)
      });
      this.saveSuccess = true;
      this.saveMessage = 'Landing saved successfully';
      setTimeout(() => { this.saveMessage = ''; this.saveSuccess = null; }, 3000);
    } catch (e) {
      console.error('Save landing failed', e);
      this.saveSuccess = false;
      this.saveMessage = 'Save landing failed';
      setTimeout(() => { this.saveMessage = ''; this.saveSuccess = null; }, 4000);
    }
  }

  private buildAccessTree(items: MenuNode[], parentId = ''): AccessNode[] {
    return items.map(item => {
      const id = parentId ? `${parentId}-${this.slugify(item.title)}` : this.slugify(item.title);
      const node: AccessNode = {
        id,
        title: item.title,
        checked: false,
        expanded: item.expanded,
        route: item.route
      };

      if (item.children && item.children.length > 0) {
        node.children = this.buildAccessTree(item.children, id);
      }

      return node;
    });
  }

  private setNodeChecked(node: AccessNode, checked: boolean): void {
    node.checked = checked;

    if (node.children) {
      node.children.forEach(child => this.setNodeChecked(child, checked));
    }

    this.syncParentStates(this.accessTree);
  }

  private syncParentStates(nodes: AccessNode[]): boolean {
    let allChecked = true;

    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.checked = this.syncParentStates(node.children);
      }

      if (!node.checked) {
        allChecked = false;
      }
    });

    return nodes.length > 0 && allChecked;
  }

  private findPath(nodes: AccessNode[], targetId: string, path: AccessNode[] = []): AccessNode[] | null {
    for (const node of nodes) {
      const nextPath = [...path, node];

      if (node.id === targetId) {
        return nextPath;
      }

      if (node.children) {
        const found = this.findPath(node.children, targetId, nextPath);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  private getSelectedLeafNodes(): AccessNode[] {
    return this.flattenNodes(this.accessTree).filter(node => node.checked && !this.hasChildren(node));
  }

  private flattenNodes(nodes: AccessNode[]): AccessNode[] {
    return nodes.reduce<AccessNode[]>((list, node) => {
      list.push(node);

      if (node.children) {
        list.push(...this.flattenNodes(node.children));
      }

      return list;
    }, []);
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  private flattenMenuForLanding(items: MenuNode[], prefix = ''): { label: string; route: string }[] {
    const list: { label: string; route: string }[] = [];

    items.forEach(it => {
      const label = prefix ? `${prefix} > ${it.title}` : it.title;
      if (it.route) {
        list.push({ label, route: it.route });
      }

      if (it.children && it.children.length > 0) {
        list.push(...this.flattenMenuForLanding(it.children, label));
      }
    });

    return list;
  }
}
