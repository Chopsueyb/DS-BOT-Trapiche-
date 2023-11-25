// node
// npm init -y ""
// npm i discord.js
// npm i @discordjs/voice
// npm i -g nodemon    "Reinicia el programa cuando se hace una modificacion"  
// npm i play-dl "Libreria que reproduce contenido de yt"
// npm i dotenv "archivo aparte"
// Ctrl + c  "Cierra el programa"

const play = require("play-dl"); //

let autoplay_op, skip_op = false;
let queue = [];
let stream , resource;
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior,
     AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection, AudioResource } = require('@discordjs/voice');

   

require("dotenv").config(); // Acceso al archivo .env desde cualquier lado del codigo debido al metodo .config

const {Client, IntentsBitField} = require('discord.js'); // Importa elementos del paquete discord.js

const client = new Client({                   // Los intents son las acciones que puedue relizar
                                             // Client es la clase y client es el bot
 intents:[3276799],

 /*                                            
    intents:[                                 // Array de Permisos para tener acceso a ciertos eventos
        IntentsBitField.Flags.Guilds,                // Permisos asociados con el server
        IntentsBitField.Flags.GuildMembers,          // Permisos asociados con los miembros del server
        IntentsBitField.Flags.GuildMessages,         // Permisos asociados con los mensajes del server
        IntentsBitField.Flags.MessageContent,        // Permisos asociados con los contenidos del mensaje 
],
*/  
        });

 // Escucha por ciertos eventos y da una respuesta
 // por medio de un call back function

// 'on' es un metodo que tiene acceso a ciertos eventos del server


let player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
    }
})


client.on('ready', (tmpclient) => {    // Accede al evento del estado del cliente (Bot), si es 'ready', imprime "BOT online"

    console.log(`BOT online`);
}
);



client.on('messageCreate', async(message) => { // Accede al evento de mensajes creados
    
    if(message.author.bot) // Revisa que el mensaje no sea de un bot, meidante la propiedad .bot que puedue ser falsa o verdadera
    {
        return;
    }
    
    if (message.content == '-pause'){
        player.pause(resource)
        message.reply('PAUSED ⏸')
    }
    
    if (message.content == '-unpause'){
        player.unpause(resource)
    }

    if (message.content == '-skip'){ // Habilita la funcion autoplay
           skip_op = true;
    }

    if (message.content == '-autoplay'){ // Habilita la funcion autoplay

        if(autoplay_op == false){
        autoplay_op = true; 
          message.reply('AutoPlay: ON ')
    }
       else {
        autoplay_op = false
        
        message.reply('AutoPlay: OFF ')
       } }

       if (message.content == '-queue'){ // Habilita la funcion autoplay

        queue.forEach(async function(entry) {
            let vid_data_queue = await play.video_basic_info(entry)
            message.channel.send(vid_data_queue.video_details.title)
          
             })
       }

    if (message.content.startsWith('-play')) // Lee la propiedad .content (contenido del mensaje ) del objeto message
    {
        

        if (!message.member.voice?.channel) return message.channel.send('Alo?') // Requiere de la informacion del canal de voz del usuario


        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        let args = message.content.split('play')[1]
        let yt_info = await play.search(args, {
            limit: 1
        })

        

        let vid_data = await play.video_basic_info(yt_info[0].url) // Guarda la informacion de ese video
    

        queue.push(yt_info[0].url) // Guarda la cancion al final del queue
         
        setInterval(play_audio, 1500) // Repite la funcion playaudio cada cierto tiempo

        async function play_audio(){ 
    
            if(player.state.status === 'idle' ||   skip_op == true){  // Reproduccion de audio/ skip 

                skip_op = false;

                 stream = await play.stream(queue[0])
     
                queue.shift()
     
                message.channel.send('PLAYING:  '+ vid_data.video_details.title)
     
              resource = createAudioResource(stream.stream, {
                 inputType: stream.type
             })
             
             player.play(resource)
         
             connection.subscribe(player)
              }


            if(player.state.status == 'idle' && autoplay_op == true && !queue.length){ // Auto Play
        
           stream = await play.stream(vid_data.related_videos[0])
 
            resource = await createAudioResource(stream.stream, {
                 inputType: stream.type
             })

              player.play(resource)

            };
        };
    };
});


// Mediante el metodo .login  realiza la siguiente accion: "Logs the client in, establishing a WebSocket connection to Discord" - Discord.js

client.login(process.env.TOKEN); 
   