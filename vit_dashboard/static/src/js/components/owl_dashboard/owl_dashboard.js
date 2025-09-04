/** @odoo-module */

import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"
const { Component, onWillStart,  useState } = owl
import { Layout } from "@web/search/layout"

import { CalHeatMap } from '../cal_heatmap/cal_heatmap'
import { GoogleMap } from "../maps/maps"
import { NumberCard } from "../number_card/number_card"
import { ListCard } from "../list_card/list_card"
import { PieChart } from "../pie_chart/pie_chart"
import { KeywordSearch } from "../keyword_search/keyword_search"
import { LocationSearch } from "../location_search/location_search"

export class OWLDashboard extends Component {
    static template = "vit_dashboard.OWLDashboard";

    setup() {
        console.log("OWLDashboard...");
        this.orm = useService("orm");

        // Load saved state from localStorage
        const savedState = this.loadState();
        console.log("setup() savedState", savedState);

        this.state = useState({
            keyword: savedState.keyword || '',
            location: savedState.location || '',
            domain: savedState.domain || [],
            locationDomain: savedState.location ? [['mitra_location', 'ilike', savedState.location]] : [],
            keywordDomain: savedState.keyword ? [['keyword', 'ilike', savedState.keyword]] : [],
            resModelDescription: '',
            mapKey: Date.now(), // Add this to force remount of GoogleMap
        });

        this.mitraNumberCardReload = null; // Placeholder for the reload method
        this.kerjasamaNumberCardReload = null; // Placeholder for the reload method
        this.mouNumberCardReload = null; // Placeholder for the reload method
        this.moaNumberCardReload = null; // Placeholder for the reload method
        this.iaNumberCardReload = null; // Placeholder for the reload method
        this.mahasiswaInboundNumberCardReload = null; // Placeholder for the reload method
        this.mahasiswaOutboundNumberCardReload = null; // Placeholder for the reload method
        this.kunjunganEksekutifNumberCardReload = null; // Placeholder for the reload method
        this.kunjunganMitraNumberCardReload = null; // Placeholder for the reload method

        this.pieChartReload1 = null; // Placeholder for the reload method
        this.pieChartReload2 = null; // Placeholder for the reload method
        this.pieChartReload3 = null; // Placeholder for the reload method
        this.pieChartReload4 = null; // Placeholder for the reload method
        this.pieChartReload5 = null; // Placeholder for the reload method
        this.pieChartReload6 = null; // Placeholder for the reload method

        this.googleMapReload = null; // Placeholder for the reload method
        this.listCardReload = null; // Placeholder for the reload method


        onWillStart(() => {
            console.log("onWillStart...OWLDashboard", this.state.domain);
            this.reloadNumberCard();
        })
    }
    saveState() {
        try {
            this.state.keywordDomain = this.state.keyword.includes(',')
                ? this.state.keyword.split(',').map(kw => ['keyword', 'ilike', kw.trim()])
                : this.state.keywordDomain

            this.combineDomain();
            const stateToSave = {
                selectedUnit: this.state.selectedUnit,
                selectedMitra: this.state.selectedMitra,
                location: this.state.location,
                keyword: this.state.keyword,
                // Save domain states
                unitDomain: this.state.unitDomain,
                locationDomain: this.state.locationDomain,
                keywordDomain: this.state.keywordDomain,
                domain: this.state.domain
            };
            // console.log("saveState...stateToSave", stateToSave);
            localStorage.setItem('kermaDashboardState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    

    loadState() {
        try {
            const savedState = localStorage.getItem('kermaDashboardState');
            if (!savedState) return {};
            
            const parsedState = JSON.parse(savedState);
            console.log("loadState...parsedState", parsedState);

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

    clearSavedState() {
        localStorage.removeItem('kermaDashboardState');
        // Reset all states to defaults
        this.state.selectedUnit = null;
        this.state.keyword = '';
        this.state.location = '';

        $('#unit_selector').val('');

        this.state.selectedMitra = undefined;
        this.state.unitDomain = [];
        this.state.locationDomain = [];
        this.state.keywordDomain = [];
        this.state.domain = [];

        this.reloadNumberCard();
      
    }

    onMitraNumberCardReload(reloadMethod) {
        this.mitraNumberCardReload = reloadMethod; // Capture the reload method
    }

    onKerjasamaNumberCardReload(reloadMethod) {
        this.kerjasamaNumberCardReload = reloadMethod; // Capture the reload method
    }

    onMoUNumberCardReload(reloadMethod) {
        this.mouNumberCardReload = reloadMethod; // Capture the reload method
    }

    onMoANumberCardReload(reloadMethod) {
        this.moaNumberCardReload = reloadMethod; // Capture the reload method
    }
    onIaNumberCardReload(reloadMethod) {
        this.iaNumberCardReload = reloadMethod; // Capture the reload method
    }

    onMahasiswaInboundNumberCardReload(reloadMethod) {
        this.mahasiswaInboundNumberCardReload = reloadMethod; // Capture the reload method
    }

    onMahasiswaOutboundNumberCardReload(reloadMethod) {
        this.mahasiswaOutboundNumberCardReload = reloadMethod; // Capture the reload method
    }

    onKunjunganEksekutifNumberCardReload(reloadMethod) {
        this.kunjunganEksekutifNumberCardReload = reloadMethod; // Capture the reload method
    }

    onKunjunganMitraNumberCardReload(reloadMethod) {
        this.kunjunganMitraNumberCardReload = reloadMethod; // Capture the reload method
    }

    onPieChartReload1(reloadMethod, chartType) {
        this.pieChartReload1 = reloadMethod; // Capture the reload method
    }

    onPieChartReload2(reloadMethod, chartType) {
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

    onGoogleMapReload(reloadMethod) {
        this.googleMapReload = reloadMethod; // Capture the reload method
    }
    onListCardReload(reloadMethod) {
        this.listCardReload = reloadMethod; // Capture the reload method
    }

    onUnitChange(e) {

        if (e === null || e === undefined) {
            this.state.selectedUnit = null;
            this.state.unitDomain = [];
        } else {
            this.state.selectedUnit = e;
        }
        this.saveState();
        this.reloadNumberCard();
    }

    onLocationSearchEnter(e) {
        console.log("onLocationSearchEnter....", e);
        this.state.location = e
        if (e !== null && e != undefined && e != '') {
            this.state.locationDomain = [['mitra_location', 'ilike', e]];
        }
        else {
            this.state.locationDomain = [];
        }
        this.saveState();
        this.reloadNumberCard();
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
        this.reloadNumberCard();
    }

    combineDomain(){
        this.state.domain = [...(this.state.unitDomain || []), ...(this.state.keywordDomain || []), ...(this.state.locationDomain || [])];
    }

    reloadNumberCard() {
        console.log("reloadNumberCard...domain=", this.state.domain);
        // this.combineDomain();

        // Call the reload method if it exists
        if (this.mitraNumberCardReload) {
            this.mitraNumberCardReload();
        }
        // Call the reload method if it exists
        if (this.kerjasamaNumberCardReload) {
            this.kerjasamaNumberCardReload();
        }
        // Call the reload method if it exists
        if (this.inboundNumberCardReload) {
            this.inboundNumberCardReload();
        }
        // Call the reload method if it exists
        if (this.outboundNumberCardReload) {
            this.outboundNumberCardReload();
        }
        if (this.mouNumberCardReload) {
            this.mouNumberCardReload();
        }
        if (this.moaNumberCardReload) {
            this.moaNumberCardReload();
        }
        if (this.iaNumberCardReload) {
            this.iaNumberCardReload();
        }
        if (this.mahasiswaInboundNumberCardReload) {
            this.mahasiswaInboundNumberCardReload();
        }
        if (this.mahasiswaOutboundNumberCardReload) {
            this.mahasiswaOutboundNumberCardReload();
        }
        if (this.kunjunganEksekutifNumberCardReload) {
            this.kunjunganEksekutifNumberCardReload();
        }
        if (this.kunjunganMitraNumberCardReload) {
            this.kunjunganMitraNumberCardReload();
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
    GoogleMap, Layout, PieChart, CalHeatMap, 
    KeywordSearch , LocationSearch,
    ListCard 
};

registry.category("actions").add("owl_dashboard", OWLDashboard)