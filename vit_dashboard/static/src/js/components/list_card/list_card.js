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
        } catch (error) {
            console.error('Error fetching data:', error);
            this.state.data = [];
            this.state.total = 0;
        }
    }

    get totalPages() {
        return Math.ceil(this.state.total / this.state.pageSize) || 1;
    }

    get pageNumbers() {
        const pages = [];
        const total = this.totalPages;
        const current = this.state.page;
        const maxButtons = 5; 
        let start = Math.max(1, current - Math.floor(maxButtons / 2));
        let end = Math.min(total, start + maxButtons - 1);
        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    getPageNumbers(current, total) {
        const pages = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            if (current <= 3) {
                pages.push(1, 2, 3, '...', total);
            } else if (current >= total - 2) {
                pages.push(1, '...', total - 2, total - 1, total);
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', total);
            }
        }

        return pages;
    }

    prevPage() {
        if (this.state.page > 1) {
            this.state.page -= 1;
            this.getData();
        }
    }

    nextPage() {
        if (this.state.page < this.totalPages) {
            this.state.page += 1;
            this.getData();
        }
    }

    goToPage(p) {
        if (p !== this.state.page && p >= 1 && p <= this.totalPages) {
            this.state.page = p;
            this.getData();
        }
    }

    onPageSizeChange(ev) {
        this.state.pageSize = parseInt(ev.target.value);
        this.state.page = 1; // Reset ke page pertama
        this.getData();
    }

    openKerjasama(item){
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
