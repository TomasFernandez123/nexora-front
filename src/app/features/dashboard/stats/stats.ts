import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexPlotOptions, ApexNonAxisChartSeries } from 'ng-apexcharts';
import { StatsService } from './services/stats';
import { Spinner } from "../../../shared/components/spinner/spinner";


type BarOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  title: ApexTitleSubtitle;
};

type LineOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

type DonutOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-stats',
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule, Spinner],
  templateUrl: './stats.html',
})
export class Stats {
  private fb = inject(FormBuilder);
  private statsSvc = inject(StatsService);

  loading = signal(false);
  error = signal<string | null>(null);

  rangeForm: FormGroup = this.fb.group({
    from: ['2025-11-01'],
    to: ['2025-11-30'],
  });

  postsPerUserOptions: Partial<BarOptions> = {
    series: [{ name: 'Posts', data: [] }],
    chart: { type: 'bar', height: 320, foreColor: 'var(--color-text)' },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: '40%' },
    },
    title: { text: 'Posts per user' },
  };

  commentsOverTimeOptions: Partial<LineOptions> = {
    series: [{ name: 'Comments', data: [] }],
    chart: { type: 'line', height: 320, foreColor: 'var(--color-text)' },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    title: { text: 'Comments over time' },
  };

  commentsPerPostOptions: Partial<DonutOptions> = {
    series: [],
    chart: { type: 'donut', height: 320, foreColor: 'var(--color-text)' },
    labels: [],
    title: { text: 'Comments per post (top + others)' },
  };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    const { from, to } = this.rangeForm.value;
    if (!from || !to) return;

    this.loading.set(true);
    this.error.set(null);

    this.statsSvc.getPostsPerUser(from, to, 10).subscribe({
      next: res => {
        const labels = res.top.map(u => u.username);
        const values = res.top.map(u => u.postCount);
        if (res.others > 0) {
          labels.push('Others');
          values.push(res.others);
        }

        this.postsPerUserOptions = {
          ...this.postsPerUserOptions,
          xaxis: { ...this.postsPerUserOptions.xaxis, categories: labels },
          series: [{ name: 'Posts', data: values }],
        };
      },
      error: err => {
        console.error(err);
        this.error.set('Error loading Posts per user');
      },
    });

    this.statsSvc.getCommentsOverTime(from, to).subscribe({
      next: res => {
        const labels = res.points.map(p => p.date);
        const values = res.points.map(p => p.commentCount);

        this.commentsOverTimeOptions = {
          ...this.commentsOverTimeOptions,
          xaxis: { ...this.commentsOverTimeOptions.xaxis, categories: labels },
          series: [{ name: 'Comments', data: values }],
        };
      },
      error: err => {
        console.error(err);
        this.error.set('Error loading Comments over time');
      },
    });

    this.statsSvc.getCommentsPerPost(from, to, 5).subscribe({
      next: res => {
        const labels = res.top.map(p => p.title);
        const values = res.top.map(p => p.commentCount);
        if (res.others > 0) {
          labels.push('Others');
          values.push(res.others);
        }

        this.commentsPerPostOptions = {
          ...this.commentsPerPostOptions,
          labels,
          series: values,
        };
      },
      error: err => {
        console.error(err);
        this.error.set('Error loading Comments per post');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  applyRange(event?: Event) {
    if (event) event.preventDefault();
    this.loadAll();
  }

}
