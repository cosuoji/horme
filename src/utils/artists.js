import onlyfansaudio from "../assets/influencercampaigns/onlyfans.png"
import gohard from "../assets/influencercampaigns/gohard.png"
import craze from "../assets/radio/radiocampaigns/craze.png"
import rayonaBg from "../assets/artists/rayona-bg.png"
import youngJonnBg from "../assets/artists/youngJonnBg.jpg"
import soonerlyric from "../assets/artists/youngjonnmusic/soonerlyric.png"
import onlyfansv from "../assets/artists/youngjonnmusic/onlyfansv.png"
import tentimes from "../assets/artists/youngjonnmusic/tentimes.png"
import soonervis from "../assets/artists/youngjonnmusic/soonervis.png"
import onlyfansofficial from "../assets/artists/youngjonnmusic/onlyfansofficial.png"
import cheche from "../assets/cheche.png"


const artists = [
    {
    id:"rayona",
    name: "Rayona",
    image: rayonaBg,
    social: {
      instagram: "itisrayona/",
      twitter: "Rayonaaaaaaaa",
      tiktok: "itisrayona?_t=ZM-8uynnbGJWSr&_r="
    },
    bio: "Rayona, born Oyelusi Gift, is an 18 year old talented singer and songwriter, who hails from Jos. With a passion for storytelling through her songs, she blends contemporary sounds to create a unique musical style that resonates with listeners.",
    tracks: [
      { 
        id: 1, 
        title: "Craze", 
        cover: craze,
        link: "https://rayona.fanlink.tv/craze" 
      },
    ],
    videos: [
    //   { 
    //     id: 1, 
    //     title: "Official Video", 
    //     thumbnail: "/video1-thumb.jpg",
    //     link: "https://youtube.com/watch?v=xyz123" 
    //   },
    //   { 
    //     id: 2, 
    //     title: "Live Performance", 
    //     thumbnail: "/video2-thumb.jpg",
    //     link: "https://youtube.com/watch?v=abc456" 
    //   },
    //   // Add 3 more videos...
    ]
   },
   {
    id:"youngjonn",
    name: "Young Jonn",
    image: youngJonnBg,
    social: {
      instagram: "youngjonn/",
      twitter: "youngjonn",
      tiktok: "youngjonn1"
    },
    bio: `John Saviours Udomboso, globally recognized as Young Jonn or 'The HITmaker,' is a trailblazing force in the Afro-pop and Afrobeats music scene.

    Following a pivotal move to Lagos in 2012, his production genius propelled him into the mainstream with chart-topping hits like 'Mafo' by Naira Marley, 'ShakitiBobo' and 'Story for the Gods' by Olamide, as well as, 'Don't Call Me' by Lil Kesh.
    
    His discography boasts an impressive roster of A-list artists, including Davido, Tiwa Savage, and Kizz Daniel. With three Nigerian Entertainment Awards for Producer of the Year and countless nominations, his impact on the industry is undeniable.
    
    Beyond production, Young Jonn's talent as a singer and songwriter has flourished. In 2021, he signed with Chocolate City Music, a strategic move that propelled him to superstardom. His debut project, Love Is Not Enough, released in April 2022, marked a significant milestone in his career scoring a remix to his first single 'Dada' with popular Afrobeats artist, Davido. This was followed by Love Is Not Enough Vol. 2. In 2024, he released his long-awaited debut album, Jiggy Forever.
    
    Touted to be his best body of work yet, Jiggy Forever is a valuable addition to his track record. The album boasts of anthems like “Big Big Things'' featuring Seyi Vibes and Kizz Daniel, Aquafina, Sharpally, and Stronger. With a string of hits and a growing global fanbase, Young Jonn continues to redefine the boundaries of Afrobeats.` ,
      tracks: [
        { 
          id: 1, 
          title: "Che Che ft. Asake", 
          cover: cheche,
          link: "https://youngjonn.lnk.to/cheche" 
        },
      { 
        id: 2, 
        title: "Only Fans", 
        cover: onlyfansaudio,
        link: "https://youngjonn.lnk.to/onlyfans" 
      },
      { 
        id: 3, 
        title: "Jiggy Forever (Album)", 
        cover: gohard,
        link: "https://youngjonn.lnk.to/jiggyforever" 
      },
    ],
    videos: [
      { 
        id: 1, 
        title: "Only Fans (Visualizer)", 
        thumbnail: onlyfansv,
        link: "https://www.youtube.com/watch?v=vdjPHbhK_TI" 
      },
      { 
        id: 2, 
        title: "Only Fans (Official Music Video)", 
        thumbnail: onlyfansofficial,
        link: "https://www.youtube.com/watch?v=Uyh0GTT16Qk" 
      },
      { 
        id: 3, 
        title: "Ten Times (Visualizer)", 
        thumbnail: tentimes,
        link: "https://www.youtube.com/watch?v=h1zdlycL-Hw" 
      },
      { 
        id: 4, 
        title: "Sooner (Visualizer)", 
        thumbnail: soonervis,
        link: "https://www.youtube.com/watch?v=GxuQSghTTN0" 
      },
      { 
        id: 5, 
        title: "Sooner (Lyric Video)", 
        thumbnail: soonerlyric,
        link: "https://www.youtube.com/watch?v=HywptJU__VU" 
      },
      // Add 3 more videos...
    ]
   }
  ];

  export default artists 