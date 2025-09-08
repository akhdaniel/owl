/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { ColorList } from "@web/core/colorlist/colorlist";
import { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class ListCard extends Component {
    static template = "vit_dashboard.ListCard";
    static props = {
        title: String,
        style: {type: String, optional: true},
        colorIndex: { type: Number, optional: true },
        model: { type: String, optional: true },
        field: { type: String, optional: true },
        fields: { type: Object, optional: true },
        onReload: { type: Function, optional: true }, // Callback to expose reload method
    };

    setup() {
        this.state = useState({
            data: [],
            domain: [],
            page: 1,
            pageSize: 10,
            total: 0,
        });
        this.orm = useService("orm");

        // Expose the reload method through the onReload callback
        if (this.props.onReload) {
            this.props.onReload(this.reload.bind(this));
        }

        onMounted(async () => {
            await this.getData();
        });

        onWillUnmount(() => {
            
        });
    }

    async reload() {       
        // Fetch new data and update the chart
        await this.getData();
    }

    async getData() {
        const savedState = this.loadState();
        const domain = savedState.domain || this.state.domain || [];
        const offset = (this.state.page - 1) * this.state.pageSize;

        try {
            const result = await this.orm.call( this.props.model , "get_statistics", [domain,'list', this.state.pageSize, offset]);
            this.state.data = result.data;
            this.state.total = result.total;


            console.log('===== ', this.state.data, this.state.total )
        } catch (error) {
            console.error('Error fetching data:', error);
            this.state.data = [];
            this.state.total = 0;
        }
    }

    openRecord(item){
        // console.log("openKerjasama", item);
        this.env.services.action.doAction({
            type: 'ir.actions.act_window',
            name: item.name,
            res_model: this.props.model,
            res_id: item.id,
            domain: [] ,
            views: [[false, 'form'],[false, 'list']],
            target: 'current',
        });
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('owlDashboardState');
            if (!savedState) return {};
            
            const parsedState = JSON.parse(savedState);
            return {
                ...parsedState
            };
        } catch (error) {
            console.error('Error loading state:', error);
            return {};
        }
    }    
}
