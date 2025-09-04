/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { ColorList } from "@web/core/colorlist/colorlist";
import { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class PieChart extends Component {
    static template = "vit_dashboard.PieChart";
    static props = {
        title: String,
        type: String,
        colorIndex: { type: Number, optional: true },
        field: { type: String, optional: true },
        model: { type: String, optional: true },
        domain: { type: Object, optional: true },
        context: { type: Object, optional: true },
        default_views: { type: String, optional: true },
        onReload: { type: Function, optional: true }, // Callback to expose reload method
    };

    setup() {
        this.canvasRef = useRef("canvas");
        this.state = useState({
            data: [],
            domain: [],
        });
        this.orm = useService("orm");

        // Expose the reload method through the onReload callback
        if (this.props.onReload) {
            this.props.onReload(this.reload.bind(this));
        }

        onWillStart(() => loadJS(["/web/static/lib/Chart/Chart.js"]));

        onMounted(async () => {
            this.state.domain = this.props.domain || [];
            await this.getStatistics();
            this.renderChart();
        });

        onWillUnmount(() => {
            if (this.chart) {
                this.chart.destroy();
            }
        });
    }

    async reload() {

        // const combinedDomain = this.props.domain ? [...this.props.domain, ...(newDomain || [])] : (newDomain || []);
        // this.state.domain = combinedDomain;

        // console.log("Reloading PieChart with new domain:", this.state.domain);

        // Fetch new data and update the chart
        await this.getStatistics();
        this.updateChart();
    }

    async getStatistics() {
        const savedState = this.loadState();
        const domain = savedState.domain || this.props.domain || [];
        // const domain = this.state.domain || [];
        this.state.domain = domain
        const field = this.props.field || "count";
        const res = await this.orm.call(
            this.props.model ,
            "get_statistics",
            [domain, field]
        );
        this.state.data = res[field];
    }

    renderChart() {
        const { labels, datasets } = this.prepareChartData();

        this.chart = new Chart(this.canvasRef.el, {
            type: this.props.type,
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow custom height
                aspectRatio: 1.5,    
                height: 320,                // Set fixed height in pixels
                scales: {
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            min: 0,
                            align: 'start',
                            padding: 10
                        },
                    },
                    x: {
                        ticks: {
                            align: 'start',
                            padding: 10,
                            autoSkip: false,
                            font: {
                                size: 6,
                            },
                        }
                    }
                }                
            },
        });
    }

    updateChart() {
        const { labels, datasets } = this.prepareChartData();

        // Update chart data
        this.chart.data.labels = labels;
        this.chart.data.datasets = datasets;

        // Re-render the chart
        this.chart.update();

    }

    prepareChartData() {
        let labels = [];
        let datasets = [];
    
        const colorKeys = ["Green", "LightBlue", "DarkViolet", "LightSalmon", "MediumBlue"];
        const colorMapping = {
            "Green": "#008000",
            "LightBlue": "#ADD8E6",
            "DarkViolet": "#9400D3",
            "LightSalmon": "#FFA07A",
            "MediumBlue": "#0000CD",
        };
    
        if (this.props.type === "pie") {
            labels = Object.keys(this.state.data);
            const color = labels.map((_, index) =>
                colorKeys[(index + (this.props.colorIndex || 0)) % colorKeys.length]
            );
            const correctedColors = color.map((clr) => colorMapping[clr] || "#CCCCCC");
            const data = Object.values(this.state.data);
            datasets = [
                {
                    label: this.props.title,
                    data: data,
                    backgroundColor: correctedColors,
                },
            ];
        } else if (this.props.type === "bar") {
            labels = Object.keys(this.state.data);
            if (labels.length !== 0) {
                const measures = Object.keys(this.state.data[labels[0]]); 
                datasets = measures.map((measure, index) => ({
                    label: measure,
                    data: labels.map((group) => this.state.data[group][measure] || 0),
                    backgroundColor: colorMapping[colorKeys[index % colorKeys.length]] || "#CCCCCC",
                }));
            } else {
                labels = ["No Data"];
                datasets = [];
            }
        }
    
        return { labels, datasets };
    }
    

    openRecord() {
        const domain = this.state.domain;
        // console.log("openRecord PieChart with domain:", domain);
        const context = this.props.context || {};
        let default_views
        if (this.props.default_views=='kanban')
            default_views = [[false, 'kanban'], [false, 'list'], [false, 'form']]
        else
            default_views = [[false, 'list'],[false, 'kanban'], [false, 'form']];

        // console.log("openRecord PieChart with context:", context);
        this.env.services.action.doAction({
            type: 'ir.actions.act_window',
            name: this.props.title,
            res_model: this.props.model,
            domain: domain || [],
            context: context,
            views: default_views,
            target: 'current',
        });
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('kermaDashboardState');
            if (!savedState) return {};
            
            const parsedState = JSON.parse(savedState);
            // Ensure domain arrays are properly restored
            return {
                ...parsedState,
                unitDomain: parsedState.unitDomain || [],
                locationDomain: parsedState.locationDomain || [],
                keywordDomain: parsedState.keywordDomain || [],
                domain: parsedState.domain || []
            };
        } catch (error) {
            console.error('Error loading state:', error);
            return {};
        }
    }
}
