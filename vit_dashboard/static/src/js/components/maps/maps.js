/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useRef, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";

export class GoogleMap extends Component {
    static template = "vit_dashboard.GoogleMap"
    static props = {
        class: { type: String, optional: true },
        title: { type: String, optional: true },
        model: { type: String, optional: true },
        domain: { type: Object, optional: true },
        onReload: { type: Function, optional: true }
    }

    setup() {
        this.orm = useService("orm");

        this.state = useState({
            locations: [],
        });

        this.mapLayers = useState({
            showMarkers: true,
        });

        this.markers = [];
        this.dataClickListener = null;


        // Expose the reload method through the onReload callback
        if (this.props.onReload) {
            this.props.onReload(this.reloadMap.bind(this));
        }  

        onWillStart(async () => {
            await this.loadGoogleMaps();
            await this.loadLocations();
        });

        onMounted(() => {
            if (window.google?.maps) {
                this.initMap();
            } else {
                console.error("Google Maps API not loaded");
            }
            window.openRecord = this.openRecord.bind(this);
        });

        onWillUnmount(() => {
            this.cleanupMap();
        });
    }

    async loadGoogleMaps() {
        const apiKey = await rpc("/gmaps/get_api_key", {});
        if (!apiKey) {
            console.error("Google Maps API key not configured");
            return;
        }
        await Promise.all([
            loadJS(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`),
            loadJS("/vit_dashboard/static/lib/markerclustererplus.min.js")
        ]);
    }

    async loadLocations() {

        const savedState = this.loadState();
        const domain = savedState.domain || this.props.domain || [];

        this.state.locations = await this.orm.call(this.props.model, 
            "get_locations", [domain]);
    }

    async reloadMap(newDomain) {
        if (newDomain) {
            this.props.domain = newDomain;
        }
        this.cleanupMap();
        await this.loadLocations();
        this.initMap();
    }

    cleanupMap() {
        // console.log("Cleaning up map...");
        if (this.markerCluster) this.markerCluster.setMap(null);
        if (this.map) {
            this.map.data.forEach(feature => this.map.data.remove(feature));
            this.map = null;
        }
        const el = document.getElementById("map");
        if (el) el.innerHTML = "";
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 20.0, lng: 150.0 },
            zoom: 2,
            mapId: 'my-map-id'
        });

        // Control buttons container
        const toggleContainer = document.createElement("div");
        toggleContainer.style.margin = "10px";
        toggleContainer.style.display = "flex";
        toggleContainer.style.gap = "5px";

        // Create and style marker toggle button
        const markerBtn = document.createElement("button");
        markerBtn.textContent = "Toggle Markers";
        markerBtn.className = "custom-map-button";
        markerBtn.onclick = () => {
            this.toggleMarkerLayer();
            markerBtn.className = this.mapLayers.showMarkers ? "custom-map-button selected" : "custom-map-button";
        };
        if (this.mapLayers.showMarkers) markerBtn.classList.add("selected");

        // Country Choropleth toggle button
        const countryBtn = document.createElement("button");
        countryBtn.textContent = "Color by Country";
        countryBtn.className = "custom-map-button selected";
        countryBtn.onclick = () => {
            this.toggleChoroplethLayer("country");
            if (this.mapLayers.showChoropleth) {
                countryBtn.classList.add("selected");
            } else {
                countryBtn.classList.remove("selected");
            }
        };

        toggleContainer.append(markerBtn, countryBtn);// countryBtn, regionBtn);
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleContainer);

        this.addMarkersWithClusters();
    }
    
    async addMarkersWithClusters() {
        // console.log("Adding markers with clusters...");
        const infoWindow = new google.maps.InfoWindow();
    
        this.markers = this.state.locations.map(loc => {
            const initial = loc.initial || loc.name?.charAt(0) || "?";
    
            const marker = new google.maps.Marker({
                position: { lat: loc.partner_latitude, lng: loc.partner_longitude },
                map: this.map,
                title: loc.name,
                label: {
                    text: initial.toUpperCase(),
                    color: "#fff",
                    fontWeight: "bold",
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: "#1978d2",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#fff",
                },
            });
    
            marker.addListener("click", () => {
                infoWindow.setContent(`
                    <h2>${loc.name}</h2>
                    <div>${loc.partner_latitude}, ${loc.partner_longitude}<br/>
                    <!--a href="/web#id=${loc.id}&model=res.partner&view_type=form"><b>View Kerjasama</b></a-->
                    <a onclick="openRecord(${loc.id}, '${loc.name}')">View Partner</a>
                    </div>
                `);
                infoWindow.open(this.map, marker);
            });
    
            return marker;
        });
    
        this.markerCluster = new MarkerClusterer(this.map, this.markers, {
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            maxZoom: 17, // ⬅️ Prevent clustering at zoom 17 and above
        });
    }
    
    toggleMarkerLayer() {
        // console.log("Toggling marker layer...");
    
        if (this.mapLayers.showMarkers) {
            // Hide all markers
            if (this.markerCluster) {
                this.markerCluster.clearMarkers();  // removes them from map
                this.markerCluster.setMap(null);
            }
            this.markers.forEach(m => m.setMap(null));
        } else {
            // Show all markers and re-cluster
            this.markers.forEach(m => m.setMap(this.map));
            this.markerCluster = new MarkerClusterer(this.map, this.markers, {
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                maxZoom: 17,
            });
        }
    
        this.mapLayers.showMarkers = !this.mapLayers.showMarkers;
    }
    
    async toggleChoroplethLayer(type) {
        // console.log("Toggling choropleth layer...");
    
        // If same type is clicked again, toggle visibility
        if (this.mapLayers.choroplethType === type && this.mapLayers.showChoropleth) {
            this.map.data.forEach(f => this.map.data.remove(f));
            this.mapLayers.showChoropleth = false;
            return;
        }
    
        // Always remove previous data layer
        this.map.data.forEach(f => this.map.data.remove(f));
        
        // Update type and set visibility on
        this.mapLayers.choroplethType = type;
        this.mapLayers.showChoropleth = true;
        
        this.loadChoroplethMap();
    }
    
    async loadChoroplethMap() {

        const res = await fetch("/vit_dashboard/static/src/data/world-countries.geojson");
        const geojson = await res.json();
    
        let aggregation = {};
        const countryToRegion = {};
    
        // Build region and country mapping
        this.state.locations.forEach(loc => {
            const country = loc.country_name;
            const region = loc.region_name;
            if (country && region) {
                countryToRegion[country] = region;
                aggregation[region] = (aggregation[region] || 0) + 1;
            }
        });
    
        // If region choropleth, apply region counts to all countries in that region
        let countryAggregation = {};
        if (this.mapLayers.choroplethType === "region") {
            for (const [country, region] of Object.entries(countryToRegion)) {
                const regionCount = aggregation[region] || 0;
                countryAggregation[country] = regionCount;
            }
        } else {
            // Standard country-based aggregation
            this.state.locations.forEach(loc => {
                const country = loc.country_name;
                if (country) {
                    countryAggregation[country] = (countryAggregation[country] || 0) + 1;
                }
            });
        }
    
        // Clear old geojson
        this.map.data.forEach(f => this.map.data.remove(f));
        this.map.data.addGeoJson(geojson);
    
        // Apply style
        this.map.data.setStyle(feature => {
            const countryName = feature.getProperty("name");
            const count = countryAggregation[countryName] || 0;
            return {
                fillColor: this.getColor(count),
                fillOpacity: 0.5,
                strokeColor: "#bbb",
                strokeWeight: 1
            };
        });
    
        const infoWindow = new google.maps.InfoWindow();
        // Remove existing listener if it exists
        if (this.dataClickListener) {
            google.maps.event.removeListener(this.dataClickListener);
            this.dataClickListener = null;
        }

        // Set a new click listener
        this.dataClickListener = this.map.data.addListener("click", event => {
            const name = event.feature.getProperty("name");
            const count = countryAggregation[name] || 0;
            infoWindow.setContent(`<strong>${name}</strong><br/>${count} mitra`);
            infoWindow.setPosition(event.latLng);
            infoWindow.open(this.map);
        });

    }
    
    getColor(count) {
        if (count > 100) return "#a50026";
        if (count > 50) return "#d73027";
        if (count > 25) return "#fc8d59";
        if (count > 10) return "#fee08b";
        if (count > 0) return "#d9f0a3";
        return "#e0f3db";
    }

    openRecord(partnerId, partnerName) {
        const domain = [['name', '=', partnerId]];
        this.env.services.action.doAction({
            type: 'ir.actions.act_window',
            name: partnerName,
            res_model: 'res.partner',
            domain: domain || [] ,
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
            };
        } catch (error) {
            console.error('Error loading state:', error);
            return {};
        }
    }   
}