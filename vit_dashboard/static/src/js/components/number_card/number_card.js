/** @odoo-module */
const { Component, onMounted, useState } = owl;
import { useService } from "@web/core/utils/hooks";

export class NumberCard extends Component {
    static template = "vit_dashboard.NumberCard";
    static props = {
        title: { type: String },
        bgColor: { type: String, optional: true },
        icon: { type: String, optional: true },
        field: { type: String, optional: true },
        model: { type: String, optional: true },
        context: { type: Object, optional: true },
        domain: { type: Object, optional: true },
        onReload: { type: Function, optional: true }, // Add onReload as an optional prop
    };

    setup() {
        this.orm = useService("orm");

        this.state = useState({
            val: { 
                total: 0, 
                total_aktif: 0, 
                total_tidak_aktif: 0 
            },
            domain: [],
        });

        // Expose the reload method through the onReload prop
        if (this.props.onReload) {
            this.props.onReload(this.reload.bind(this));
        }

        onMounted(async () => {
            this.reload();
        });
    }

    async reload() {
        const savedState = this.loadState()
        this.state.domain = this.props.domain  || [];
        await this.getStatistics();
    }

    async getStatistics() {
        const domain = this.state.domain || [];
        const field = this.props.field || "count";

        const res = await this.orm.call(this.props.model, "get_statistics", [domain, field]);

        this.state.val = res;
    }

    openRecord() {
        const domain = this.state.domain;
        const context = this.props.context || {};
        // console.log("openRecord NumberCard with domain, conntext:", domain, context);
        this.env.services.action.doAction({
            type: 'ir.actions.act_window',
            name: this.props.title,
            res_model: this.props.model,
            domain: domain ,
            context: context,
            views: [[false, 'list'], [false, 'form']],
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

