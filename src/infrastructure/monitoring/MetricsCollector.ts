export class MetricsCollector {
  constructor() {
    console.log('Metrics collector initialized');
  }

  collect(): void {
    // Basic metrics collection
  }
}

let metricsCollector: MetricsCollector;

export function getMetricsCollector(): MetricsCollector {
  if (!metricsCollector) {
    metricsCollector = new MetricsCollector();
  }
  return metricsCollector;
}