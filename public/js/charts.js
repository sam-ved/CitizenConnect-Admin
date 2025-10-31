// Custom Chart Implementation - Pure Canvas Charts

class PieChart {
  constructor(canvasId, data, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.data = data; // Array of { label, value }
    this.options = {
      title: options.title || '',
      colors: options.colors || this.generateColors(data.length),
      padding: options.padding || 40,
      ...options,
    };

    this.setup();
    this.draw();
    window.addEventListener('resize', () => this.draw());
  }

  setup() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  generateColors(count) {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw title
    if (this.options.title) {
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.options.title, this.width / 2, 25);
    }

    // Calculate total and center
    const total = this.data.reduce((sum, item) => sum + item.value, 0);
    const centerX = this.width / 2;
    const centerY = this.height / 2 + 10;
    const radius = Math.min(this.width, this.height) / 2 - this.options.padding;

    // Draw pie slices
    let currentAngle = -Math.PI / 2;

    this.data.forEach((item, index) => {
      if (item.value === 0) return;

      const sliceAngle = (item.value / total) * 2 * Math.PI;

      // Draw slice
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = this.options.colors[index];
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      const percentage = ((item.value / total) * 100).toFixed(1);
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillStyle = '#fff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(percentage + '%', labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw legend
    this.drawLegend();
  }

  drawLegend() {
    const legendX = this.options.padding;
    const legendY = this.height - 80;
    const itemHeight = 20;

    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    this.data.forEach((item, index) => {
      const y = legendY + index * itemHeight;

      // Color box
      this.ctx.fillStyle = this.options.colors[index];
      this.ctx.fillRect(legendX, y - 7, 12, 12);

      // Label
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(`${item.label} (${item.value})`, legendX + 18, y);
    });
  }
}

class BarChart {
  constructor(canvasId, data, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.data = data; // Array of { label, value }
    this.options = {
      title: options.title || '',
      color: options.color || '#4285F4',
      padding: options.padding || 50,
      ...options,
    };

    this.setup();
    this.draw();
    window.addEventListener('resize', () => this.draw());
  }

  setup() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw title
    if (this.options.title) {
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.options.title, this.width / 2, 25);
    }

    const chartPadding = this.options.padding;
    const chartWidth = this.width - chartPadding * 2;
    const chartHeight = this.height - chartPadding * 2;

    // Find max value
    const maxValue = Math.max(...this.data.map((d) => d.value));

    // Draw axes
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(chartPadding, chartHeight + chartPadding);
    this.ctx.lineTo(this.width - chartPadding, chartHeight + chartPadding);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(chartPadding, chartPadding);
    this.ctx.lineTo(chartPadding, chartHeight + chartPadding);
    this.ctx.stroke();

    // Draw bars
    const barWidth = chartWidth / (this.data.length * 1.5);
    const barSpacing = chartWidth / this.data.length;

    this.data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = chartPadding + index * barSpacing + (barSpacing - barWidth) / 2;
      const y = chartHeight + chartPadding - barHeight;

      // Draw bar
      this.ctx.fillStyle = this.options.color;
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      this.ctx.font = 'bold 11px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillText(item.value, x + barWidth / 2, y - 5);

      // Draw label
      this.ctx.font = '11px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.save();
      this.ctx.translate(x + barWidth / 2, chartHeight + chartPadding + 10);

      // Truncate long labels
      let label = item.label;
      if (label.length > 10) {
        label = label.substring(0, 10) + '...';
      }

      this.ctx.fillText(label, 0, 0);
      this.ctx.restore();
    });

    // Draw Y-axis labels
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = '#666';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue / 5) * i);
      const y = chartHeight + chartPadding - (i / 5) * chartHeight;
      this.ctx.fillText(value, chartPadding - 10, y);

      // Grid line
      this.ctx.strokeStyle = '#f0f0f0';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(chartPadding, y);
      this.ctx.lineTo(this.width - chartPadding, y);
      this.ctx.stroke();
    }
  }
}

// Tooltip helper for chart interaction
class ChartTooltip {
  constructor() {
    this.tooltip = null;
  }

  show(x, y, text) {
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'chart-tooltip';
      document.body.appendChild(this.tooltip);
    }

    this.tooltip.textContent = text;
    this.tooltip.style.left = x + 10 + 'px';
    this.tooltip.style.top = y + 10 + 'px';
    this.tooltip.style.display = 'block';
  }

  hide() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
}
