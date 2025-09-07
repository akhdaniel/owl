/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class MyChart extends Component {
    static template = "vit_dashboard.MyChart";
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
        // Fetch new data and update the chart
        await this.getStatistics();
        this.updateChart();
    }

    async getStatistics() {        
        const savedState = this.loadState();
        console.log('chart======',savedState)
        const domain = savedState.domain || this.props.domain || [];
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

        labels = Object.keys(this.state.data);
        const color = labels.map((_, index) =>
            colorKeys[(index + (this.props.colorIndex || 0)) % colorKeys.length]
        );
        const correctedColors = color.map((clr) => colorMapping[clr] || "#CCCCCC");    


        if (this.props.type === "pie") {
            const data = Object.values(this.state.data);
            datasets = [
                {
                    label: this.props.title,
                    data: data,
                    backgroundColor: correctedColors,
                },
            ];
        } else if (this.props.type === "bar") {
            const dataValues = Object.values(this.state.data);
            datasets = [{
                label: 'Count',
                data: dataValues,
                backgroundColor: correctedColors,
                // borderColor: [
                //     'rgba(255, 99, 132, 1)',
                //     'rgba(54, 162, 235, 1)',
                //     'rgba(255, 206, 86, 1)',
                //     'rgba(75, 192, 192, 1)'
                // ],
                borderWidth: 1
            }]
        }

        return { labels, datasets };
    }
    

    openRecord() {
        const domain = this.state.domain;
        // console.log("openRecord MyChart with domain:", domain);
        const context = this.props.context || {};
        let default_views
        if (this.props.default_views=='kanban')
            default_views = [[false, 'kanban'], [false, 'list'], [false, 'form']]
        else
            default_views = [[false, 'list'],[false, 'kanban'], [false, 'form']];

        // console.log("openRecord MyChart with context:", context);
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
            const savedState = localStorage.getItem('owlDashboardState');
            if (!savedState) return {};
            
            const parsedState = JSON.parse(savedState);
            // Ensure domain arrays are properly restored
            return {
                ...parsedState,
                partnerDomain: parsedState.partnerDomain || [],
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
