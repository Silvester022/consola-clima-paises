import fs from 'node:fs';

import axios from "axios";

export class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerDB();
    }

    paramsMaps(lugar = '') {

        return {
            'key': process.env.MAP_KEY || '',
            'q': lugar,
            'limit': 5,
            'accept-language': 'es',
            'format': 'json'
        }
    }

    get paramsWheater() {

        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    get historialCapitalizado() {
        return this.historial.map( lugar => {
            
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    async ciudad(lugar = '') {

        try {
            const instance = axios.create({
                baseURL: `https://us1.locationiq.com/v1/search`,
                params: this.paramsMaps(lugar)
            })

            const res = await instance.get();

            return res.data.map(lugar => ({

                id: lugar.place_id,
                name: lugar.display_name,
                lat: lugar.lat,
                lon: lugar.lon
            }));

        } catch (error) {
            return [];
        }
    }

    async climaLugar(lat, lon) {

        try {
            // instancia de axios
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: { lat, lon, ...this.paramsWheater }
            })

            const res = await instance.get();

            const { weather, main } = res.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.error(error);
        }
    }

    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLocaleLowerCase()))
            return;

        this.historial.splice(0, 5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        // grabar en db
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial,
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerDB() {
        // debe existir
        if (!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);
        
        this.historial = data.historial;
    }
}