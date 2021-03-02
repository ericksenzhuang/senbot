const Discord = require('discord.js');

const { executionasyncresource } = require('async_hooks');

const ytdl = require('ytdl-core');

const client = new Discord.Client();

const prefix = '+';

var servers = {};

const queue = new Map();

const { YTSearcher } = require('ytsearcher');

const searcher = new YTSearcher({
    key : "AIzaSyBsn6qJl6v6APN88y-FxScXMCFVPDgH0j0",
    revealed: true
});


client.once('ready', () => {
    console.log('konconesen is online!');
    client.user.setActivity('@SeN', {type: "LISTENING"}).catch(console.error);

});

client.on('message', async(message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const serverQueue = queue.get(message.guild.id)


    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();


        if (command == 'youtube'){
            message.channel.send('https://www.youtube.com/channel/UCo3klMdMKjr-GcWOV8nDgwA');


   }   
   
        else if (command == 'nimo'){
            message.channel.send('https://www.nimo.tv/ericksenzhuang');

   
   }   
   
        switch(command){
            case 'play':
                execute(message, serverQueue);
                break;
            case 'stop':
                stop(message, serverQueue);
                break;
            case 'skip':
                skip(message, serverQueue);
                break;
            case 'pause' :
                pause(serverQueue);
                break;
            case 'resume' :
                resume(serverQueue);
                break;
        }

        async function execute(message, serverQueue){
            let vc = message.member.voice.channel;
            if(!vc){
                return message.channel.send("please join a voice chat first");
            }else{
                let result = await searcher.search(args.join(" "), { type: "video" })
                const songInfo = await ytdl.getInfo(result.first.url)


                let song = {
                    tittle: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url
                };

                if(!serverQueue){
                    const queueConstructor = {
                        txtChannel: message.channel,
                        vChannel: vc,
                        connection: null,
                        songs: [],
                        volume: 10,
                        playing: true
                    };
                    queue.set(message.guild.id, queueConstructor);

                    queueConstructor.songs.push(song);

                    try{
                        let connection = await vc.join();
                        queueConstructor.connection = connection;
                        play(message.guild, queueConstructor.songs[0]);
                    }catch (err){
                        console.error(err);
                        queue.delete(message.guild.id);
                        return message.channel.send(`unable to join the voice chat ${err}`)
                    }
                }else{
                    serverQueue.songs.push(song);
                    return message.channel.send(`The song has been added ${song.url}`);
                }
            }
        }
        function play(guild, song){
            const serverQueue = queue.get(guild.id);
            if(!song){
                serverQueue.vChannel.leave();
                queue.delete(guild.id);
                return;
            }
            const dispatcher = serverQueue.connection
                .play(ytdl(song.url))
                .on('finish', () =>{
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);              
                })
                serverQueue.txtChannel.send(`now playing ${serverQueue.songs[0].url}`);

        }

        function stop(message, serverQueue){
            if(!message.member.voice.channel)
                return message.channel.send("you need to join the voice chat first!");
            serverQueue.song = [];
            serverQueue.connection.dispatcher.end();
        }
        function skip (message, serverQueue){
            if(!message.member.voice.channel)
                return message.channel.send("you need to join the voice chat first!");
            if(!serverQueue)
                return message.channel.send("there is nothing to skip!");
            serverQueue.connection.dispatcher.end();
        }
        function pause(serverQueue){
            if(!serverQueue.connection)
                return message.channel.send("there is no music currently playing!");
            if(!message.member.voice.channel)
                return message.channel.send("you are not in the voice channel!")
            if(serverQueue.connection.dispatcher.paused)
                return message.channel.send("the song is already paused");
            serverQueue.connection.dispatcher.pause();
            message.channel.send("the song has been paused!");
        }
        function resume(serverQueue){
            if(!serverQueue.connection)
                return message.channel.send("there is no music currently playing!");
            if(!message.member.voice.channel)
                return message.channel.send("you are not in the voice channel!")
            if(serverQueue.connection.dispatcher.resumed)
                return message.channel.send("the song is already playing!");
            serverQueue.connection.dispatcher.resume();
            message.channel.send("the song has been resumed!");
        }

});



client.login('ODE1NTkyMTU0MDgzNzU0MDA0.YDupYg.NeCT_idEa14Ow4Zwyx0uB5wns3c');
