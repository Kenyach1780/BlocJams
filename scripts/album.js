// Example Album
var albumPicasso = {
    title: 'The Colors',
    artist: 'Pablo Picasso',
    label: 'Cubism',
    year: '1881',
    albumArtUrl: 'assets/images/album_covers/01.png',
    songs: [
        { title: 'Blue', duration: '4:26' },
        { title: 'Green', duration: '3:14' },
        { title: 'Red', duration: '5:01' },
        { title: 'Pink', duration: '3:21' },
        { title: 'Magenta', duration: '2:15' }
    ]
};

// Another Example Album
var albumMarconi = {
    title: 'The Telephone',
    artist: 'Guglielmo Marconi',
    label: 'EM',
    year: '1909',
    albumArtUrl: 'assets/images/album_covers/20.png',
    songs: [
        { title: 'Hello, Operator?', duration: '1:01' },
        { title: 'Ring, ring, ring', duration: '5:01' },
        { title: 'Fits in your pocket', duration: '3:21' },
        { title: 'Can you hear me now?', duration: '3:14' },
        { title: 'Wrong phone number', duration: '2:15' }
    ]
};

var albumTimberlake = {
    title: 'The 20/20 Experience',
    artist: 'Justin Timberlake',
    label: 'RCA',
    year: '2013',
    albumArtUrl: 'assets/images/album_covers/JT2020.png',
    songs: [
        { title: 'Pusher Love Girl', duration: '8:02' },
        { title: 'Suit & Tie', duration: '5:26' },
        { title: 'Don\'t Hold the Wall', duration: '7:10' },
        { title: 'Strawberry Bubblegum', duration: '7:59' },
        { title: 'Tunnel Vision', duration: '6:46' },
        { title: 'Spaceship Coupe', duration: '7:17' },
        { title: 'That Girl', duration: '4:47' },
        { title: 'Let the Groove Get In', duration: '7:11' },
        { title: 'Mirrors', duration: '8:05' },
        { title: 'Blue Ocean Floor', duration: '7:19' }
    ]
};

var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
     +  '  <td class="song-item-number">' + songNumber + '</td>'
     +  '  <td class="song-item-title">' + songName + '</td>'
     +  '  <td class="song-itme-duration">' + songLength + '</td>'
     +  '</tr>'
     ;
    
    return template;
};

//#1 Select elements that we want to populate with text dynamically
var albumTitle = document.getElementsByClassName('album-view-title')[0];
var albumArtist = document.getElementsByClassName('album-view-artist')[0];
var albumReleaseInfo = document.getElementsByClassName('album-view-release-info')[0];
var albumImage = document.getElementsByClassName('album-cover-art')[0];
var albumSongList = document.getElementsByClassName('album-view-song-list')[0];

var setCurrentAlbum = function(album) {
    
    //#2 Assign values to each part of the album (text, images)
    albumTitle.firstChild.nodeValue = album.title;
    albumArtist.firstChild.nodeValue = album.artist;
    albumReleaseInfo.firstChild.nodeValue = album.year + '' + album.label;
    albumImage.setAttribute('src', album.albumArtUrl);
    
    //#3 Clear contents of album song list container
    albumSongList.innerHTML = '';
    
    //#4 Build list of songs from album JavaScript object
    for (var i = 0; i < album.songs.length; i++) {
        albumSongList.innerHTML += createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    }
};

window.onload = function() {
    setCurrentAlbum(albumPicasso);
    
    var albums = [albumPicasso, albumMarconi, albumTimberlake];
    var index = 1;
    albumImage.addEventListener("click", function(event) {
        setCurrentAlbum(albums[index]);
        index++;
        if (index == albums.length) {
            index = 0;
        }
    });
};


 
