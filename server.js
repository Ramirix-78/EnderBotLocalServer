// server.js

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const { checkServerOnline, getServerInfo } = require('./ping');  // Importamos las funciones necesarias

const app = express();
const port = 3000;

app.use(express.json());  // Para manejar JSON

// Endpoint para iniciar el servidor
app.post('/startserver', async (req, res) => {
    try {
        // Intentar verificar si el servidor de Minecraft ya está en línea
        let isOnline = await checkServerOnline();

        if (isOnline) {
            // Si el servidor ya está en línea, obtener la información del servidor
            const serverInfo = await getServerInfo();
            return res.send({
                message: 'El servidor de Minecraft ya está en línea.',
                status: 'online',
                players: serverInfo.players,
                max_players: serverInfo.max_players,
                motd: serverInfo.motd
            });
        } else {
            // Si el servidor no está en línea, iniciar el proceso .bat
            console.log('Servidor de Minecraft apagado, iniciando...');
            const archivoBat = path.join('E:', 'MC', 'HostServer(1.20.1)v2024', 'run.bat'); 

            // Ejecutar el archivo .bat
            const batProcess = spawn('cmd.exe', ['/c', 'start', archivoBat], {
                shell: true,
                cwd: 'E:/MC/HostServer(1.20.1)v2024'
            });

            // Intentar hacer ping al servidor de Minecraft después de iniciar el archivo .bat
            let retries = 0;
            const maxRetries = 12;  // Intentar hasta 12 veces (60 segundos)
            const checkInterval = setInterval(async () => {
                try {
                    retries++;
                    console.log(`Intento ${retries} para hacer ping al servidor...`);
                    isOnline = await checkServerOnline();  // Verificar si el servidor está en línea

                    if (isOnline) {
                        clearInterval(checkInterval);  // Si está online, dejamos de hacer ping
                        const serverInfo = await getServerInfo();
                        return res.send({
                            message: 'Servidor de Minecraft iniciado correctamente.',
                            status: 'online',
                            players: serverInfo.players,
                            max_players: serverInfo.max_players,
                            motd: serverInfo.motd
                        });
                    }

                    if (retries >= maxRetries) {
                        clearInterval(checkInterval);  // Limitar el número de intentos
                        return res.status(500).send('El servidor de Minecraft no pudo iniciarse a tiempo.');
                    }
                } catch (error) {
                    console.log('Error al verificar el estado del servidor:', error);
                }
            }, 5000);  // Cada 5 segundos, intentamos hacer ping

            // Control de salida del proceso .bat
            batProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data.toString()}`);
            });

            batProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data.toString()}`);
            });

            batProcess.on('close', (code) => {
                console.log('Proceso de cmd cerrado con código:', code);
                return res.status(500).send('Hubo un error al intentar iniciar el servidor.');
            });

            batProcess.on('error', (err) => {
                console.error(`Error al iniciar el proceso: ${err.message}`);
                return res.status(500).send('Hubo un error al intentar iniciar el servidor.');
            });
        }
    } catch (error) {
        console.error('Error en la verificación del estado del servidor:', error);
        return res.status(500).send('Hubo un error al intentar verificar el estado del servidor.');
    }
});

app.listen(port, () => {
    console.log(`Servidor intermediario escuchando en http://localhost:${port}`);
});
