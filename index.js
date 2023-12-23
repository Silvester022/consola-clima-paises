
import 'dotenv/config';

import { inquirerMenu, leerInput, listarLugares, pausa } from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";

const main = async () => {

    let opt;
    const busquedas = new Busquedas();

    do {
        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                const termino = await leerInput('Ciudad:'); // mostrar mensaje

                const lugares = await busquedas.ciudad(termino); // buscar los lugares

                const id = await listarLugares(lugares); // seleccionar el lugar
                if (id === 0) continue;

                const lugarSel = lugares.find(l => l.id === id);

                // si no se selecciona 0, se agrega en la bd
                busquedas.agregarHistorial(lugarSel.name)

                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lon); // datos del clima

                // console.clear();
                console.log('Información de la ciudad'); // mostrar resultados
                console.log('CIUDAD:', lugarSel.name.green);
                console.log('LAT: ' + lugarSel.lat);
                console.log('LON: ' + lugarSel.lon);

                console.log('TEMPERATURA: ' + clima.temp);
                console.log('MIN: ' + clima.min);
                console.log('MAX: ' + clima.max);
                console.log('ESTA: ' + clima.desc);

                break;

            case 2:
                busquedas.historialCapitalizado.forEach((lugar, i) => {

                    const idx = i + 1;

                    console.log(`${idx}. `.green + `${lugar}`);
                });

                break;
        }

        if (opt !== 0) await pausa();

    } while (opt !== 0);
}

main();