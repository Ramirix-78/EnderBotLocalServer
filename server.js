// server.js

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const config = require('./config.json');

const app = express();
const port = 3000;
const START_SCRIPT = path.join('E:', 'MC', 'HostServer(1.20.1)v2024', 'run.bat'); 

app.use(express.json());  // Para manejar JSON

// Verificar si el servidor está en línea
async function isServerOnline() {
    try {
        const response = await axios.get(`http://${config.serverIp}:${config.serverPort}/status`, { timeout : 5000});
        return response.status === 200;
    } catch {
        return false; 
    }
}

// Endpoint para iniciar el servidor
app.post('/startserver', async (req, res) => {
    const online = await isServerOnline();

    if (online) {
        return res.json({
            status: 'online',
            players: 0, // Puedes reemplazar con una llamada para obtener jugadores conectados
            max_players: 20, // Cambia al máximo de jugadores permitido
        });
    }

    // Si el servidor está apagado, ejecuta el archivo .bat
    const batProcess = spawn('cmd.exe', ['/c', 'start', `run.bat`], {
        shell: true,
        cwd: path.join('E:', 'MC', 'HostServer(1.20.1)v2024'), // Directorio de trabajo del servidor
    });

    batProcess.on('error', (error) => {
        console.error('Error al iniciar el servidor:', error);
        return res.status(500).json({ error: 'No se pudo iniciar el servidor' });
    });

    batProcess.on('close', (code) => {
        console.log(`El proceso terminó con el código: ${code}`);
        res.json({ status: 'starting' });
    });

    // Respuesta inmediata para indicar que el proceso fue iniciado
    res.json({ status: 'starting' });
});

app.listen(port, () => {
    console.log(`Servidor intermediario escuchando en http://localhost:${port}`);
});
