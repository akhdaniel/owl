/** @odoo-module */

import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"
const { Component, onWillStart,  useState, onMounted } = owl
import { Layout } from "@web/search/layout"

import { CalHeatMap } from '../cal_heatmap/cal_heatmap'
import { GoogleMap } from "../maps/maps"
import { NumberCard } from "../number_card/number_card"
import { ListCard } from "../list_card/list_card"
import { MyChart } from "../chart/chart"
import { KeywordSearch } from "../keyword_search/keyword_search"
import { LocationSearch } from "../location_search/location_search"
import { PartnerSelector } from '../partner_selector/partner_selector'

export class OWLDashboard extends Component {
    static template = "vit_dashboard.OWLDashboard";

    setup() {
        console.log("OWLDashboard...");
        this.orm = useService("orm");

        // Load saved state from localStorage
        const savedState = this.loadState();

        this.state = useState({
            keyword: savedState.keyword || '',
            location: savedState.location || '',
            domain: savedState.domain || [],
            locationDomain: savedState.location ? [['partner_location', 'ilike', savedState.location]] : [],
            keywordDomain: savedState.keyword ? [['keyword', 'ilike', savedState.keyword]] : [],
            resModelDescription: '',
            selectedPartner: savedState.selectedPartner,
        });

        onWillStart(() => {
            console.log("onWillStart...OWLDashboard");
            this.reloadDashboardItems();
        })

        onMounted(()=>{
            if (this.state.selectedPartner)
                document.querySelector('.o-autocomplete--input').value = this.state.selectedPartner.name;
        })
        
        
        this.numberCardReload1 = null; // Placeholder for the reload method
        this.mumberCardReload2 = null; // Placeholder for the reload method
        this.mumberCardReload3 = null; // Placeholder for the reload method
        this.mumberCardReload4 = null; // Placeholder for the reload method
        this.mumberCardReload5 = null; // Placeholder for the reload method

        this.pieChartReload1 = null; // Placeholder for the reload method
        this.pieChartReload2 = null; // Placeholder for the reload method
        this.pieChartReload3 = null; // Placeholder for the reload method
        this.pieChartReload4 = null; // Placeholder for the reload method
        this.pieChartReload5 = null; // Placeholder for the reload method
        this.pieChartReload6 = null; // Placeholder for the reload method
        this.pieChartReload7 = null; // Placeholder for the reload method

        this.googleMapReload = null; // Placeholder for the reload method
        this.listCardReload = null; // Placeholder for the reload method

    }

    saveState() {
        try {
            this.state.keywordDomain = this.state.keyword.includes(',')
                ? this.state.keyword.split(',').map(kw => ['keyword', 'ilike', kw.trim()])
                : this.state.keywordDomain

            this.combineDomain();
            const stateToSave = {
                selectedPartner: this.state.selectedPartner,
                location: this.state.location,
                keyword: this.state.keyword,
                // Save domain states
                partnerDomain: this.state.partnerDomain,
                locationDomain: this.state.locationDomain,
                keywordDomain: this.state.keywordDomain,
                domain: this.state.domain
            };
            // console.log("saveState...stateToSave", stateToSave);
            localStorage.setItem('owlDashboardState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('owlDashboardState');
            if (!savedState) return {};
            
            const parsedState = JSON.parse(savedState);

            return {
                ...parsedState,
            };
        } catch (error) {
            console.error('Error loading state:', error);
            return {};
        }
    }

    clearSavedState() {
        localStorage.removeItem('owlDashboardState');

        this.state.selectedPartner = null;
        this.state.keyword = '';
        this.state.location = '';
        document.querySelector('.o-autocomplete--input').value = '';

        this.state.partnerDomain = [];
        this.state.locationDomain = [];
        this.state.keywordDomain = [];
        this.state.domain = [];

        this.reloadDashboardItems();
      
    }

    onPartnerSelected(e) {

        console.log('onPartnerSelected e',e)
        if (e === null || e === undefined) {
            this.state.selectedPartner = null;
            this.state.partnerDomain = [];
        } else {
            this.state.selectedPartner = e;
            this.state.partnerDomain = [['partner_id', '=', e.id]];
        }
        this.saveState();
        this.reloadDashboardItems();
    }

    onNumberCardReload1(reloadMethod) {
        this.numberCardReload1 = reloadMethod; // Capture the reload method
    }

    onNumberCardReload2(reloadMethod) {
        this.mumberCardReload2 = reloadMethod; // Capture the reload method
    }

    onNumberCardReload3(reloadMethod) {
        this.mumberCardReload3 = reloadMethod; // Capture the reload method
    }

    onNumberCardReload4(reloadMethod) {
        this.mumberCardReload4 = reloadMethod; // Capture the reload method
    }
    onNumberCardReload5(reloadMethod) {
        this.mumberCardReload5 = reloadMethod; // Capture the reload method
    }

    onPieChartReload1(reloadMethod) {
        this.pieChartReload1 = reloadMethod; // Capture the reload method
    }

    onPieChartReload2(reloadMethod) {
        this.pieChartReload2 = reloadMethod; // Capture the reload method
    }

    onPieChartReload3(reloadMethod) {
        this.pieChartReload3 = reloadMethod; // Capture the reload method
    }

    onPieChartReload4(reloadMethod) {
        this.pieChartReload4 = reloadMethod; // Capture the reload method
    }
    onPieChartReload5(reloadMethod) {
        this.pieChartReload5 = reloadMethod; // Capture the reload method
    }
    onPieChartReload6(reloadMethod) {
        this.pieChartReload6 = reloadMethod; // Capture the reload method
    }
    onPieChartReload7(reloadMethod) {
        this.pieChartReload7 = reloadMethod; // Capture the reload method
    }

    onGoogleMapReload(reloadMethod) {
        this.googleMapReload = reloadMethod; // Capture the reload method
    }
    onListCardReload(reloadMethod) {
        this.listCardReload = reloadMethod; // Capture the reload method
    }

    onLocationSearchEnter(e) {
        console.log("onLocationSearchEnter....", e);
        this.state.location = e
        if (e !== null && e != undefined && e != '') {
            this.state.locationDomain = [['partner_location', 'ilike', e]];
        }
        else {
            this.state.locationDomain = [];
        }
        this.saveState();
        this.reloadDashboardItems();
    }

    onKeywordSearchEnter(e) {
        console.log("onKeywordSearchEnter....", e);
        this.state.keyword = e
        if (e !== null && e != undefined && e != '') {
            this.state.keywordDomain = [['keyword', 'ilike', e]];
        }
        else {
            this.state.keywordDomain = [];
        }
        this.saveState();
        this.reloadDashboardItems();
    }

    combineDomain(){
        this.state.domain = [...(this.state.partnerDomain || []), ...(this.state.keywordDomain || []), ...(this.state.locationDomain || [])];
    }

    reloadDashboardItems() {

        // Call the reload method if it exists
        if (this.numberCardReload1) {
            this.numberCardReload1();
        }
        // Call the reload method if it exists
        if (this.mumberCardReload2) {
            this.mumberCardReload2();
        }

        if (this.mumberCardReload3) {
            this.mumberCardReload3();
        }
        if (this.mumberCardReload4) {
            this.mumberCardReload4();
        }
        if (this.mumberCardReload5) {
            this.mumberCardReload5();
        }
       
        // Call the reload method if it exists
        if (this.pieChartReload1) {
            this.pieChartReload1();
        }
    
        if (this.pieChartReload2) {
            this.pieChartReload2();
        }
    
        if (this.pieChartReload3) {
            this.pieChartReload3();
        }    
        if (this.pieChartReload4) {
            this.pieChartReload4();
        }
        if (this.pieChartReload5) {
            this.pieChartReload5();
        }
        if (this.pieChartReload6) {
            this.pieChartReload6();
        }
        if (this.pieChartReload7) {
            this.pieChartReload7();
        }

        if (this.googleMapReload) {
            this.googleMapReload();
        }
        if (this.listCardReload) {
            this.listCardReload();
        }
    }
}

OWLDashboard.components = { 
    NumberCard, 
    GoogleMap, 
    Layout, 
    MyChart, 
    CalHeatMap, 
    KeywordSearch , 
    LocationSearch,
    PartnerSelector,
    ListCard 
};

registry.category("actions").add("owl_dashboard", OWLDashboard)