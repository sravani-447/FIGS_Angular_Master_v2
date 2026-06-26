import { Component, Input, OnChanges, ViewChild, ElementRef, SimpleChanges, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-common-chart',
  template: `<canvas #chartCanvas></canvas>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    canvas { width: 100% !important; height: 100% !important; }
  `]
})
export class CommonChartComponent implements OnChanges, AfterViewInit {
  @Input() type: 'pie' | 'doughnut' | 'bar' = 'pie';
  @Input() data: any; // Expects { labels: string[], values: number[] }
  
  @ViewChild('chartCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  
  private chartInstance: any;

  ngAfterViewInit(): void {
    if (this.data) {
      this.initChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // This triggers when fetchDashboardData updates the config
    if (changes['data'] && this.canvas) {
      this.initChart();
    }
  }

  // THE FULL FUNCTION YOU WERE MISSING
  initChart(): void {
    // 1. If an old chart exists, destroy it first to prevent overlapping
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // 2. Ensure we have data before trying to draw
    if (!this.data || !this.data.labels) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // 3. Create the new chart
    this.chartInstance = new Chart(ctx, {
      type: this.type as any,
      data: {
        labels: this.data.labels,
        datasets: [{
          data: this.data.values,
          backgroundColor: [
            '#6366f1', '#ec4899', '#10b981', '#f59e0b', 
            '#06b6d4', '#8b5cf6', '#ef4444'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { family: 'Poppins', size: 11 } }
          }
        }
      }
    });
  }
}