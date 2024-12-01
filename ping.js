// ping.js

const mcs = require('node-mcstatus');
const config = require("./config.json");  // Si tienes tu IP y puerto en config.json

const serverIp = config.serverIp || '172.25.158.140';  // IP del servidor
const serverPort = config.serverPort || 25565;  // Puerto del servidor

// Función para verificar si el servidor está en línea
function checkServerOnline() {
    return new Promise((resolve, reject) => {
        MinecraftServerUtil.ping(serverIp, serverPort, (err, response) => {
            if (err) {
                console.error("Error al hacer ping al servidor de Minecraft:", err);
                return reject(false);  // Rechazamos la promesa si hay un error
            } else {
                console.log("El servidor está en línea. Respuesta:", response);
                return resolve(true);  // Resolvemos con true si está en línea
            }
        });
    });
}

// Función para obtener la información del servidor
function getServerInfo() {
    return new Promise((resolve, reject) => {
        MinecraftServerUtil.status(serverIp, serverPort, (err, response) => {
            if (err) {
                console.error("Error al obtener información del servidor:", err);
                return reject(null);  // Rechazamos si hay un error
            } else {
                console.log("Información del servidor:", response);
                const serverInfo = {
                    players: response.players.online,  // Número de jugadores conectados
                    max_players: response.players.max, // Número de jugadores máximos
                    motd: response.motd,               // Nombre del servidor (o MOTD)
                    version: response.version.name,    // Versión del servidor
                };
                return resolve(serverInfo);  // Resolvemos con la información del servidor
            }
        });
    });
}

module.exports = { checkServerOnline, getServerInfo };
