var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
     +  '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     +  '  <td class="song-item-title">' + songName + '</td>'
     +  '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
     +  '</tr>'
     ;
    
    var $row = $(template);
    
    var clickHandler = function() {
       var songNumber = parseInt($(this).attr('data-song-number'));
       
        if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            
            currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.
            setSong(songNumber);
            currentSoundFile.play();
            $(this).html(pauseButtonTemplate);
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updatePlayerBarSong();
            updateSeekBarWhileSongPlays();
            // REFACTOR: if user clicks new song, play current sound file after calling setSong()
        } else if (currentlyPlayingSongNumber === songNumber) {
            // REFACTOR: remove currentlyPlayingSongNumber = null
            // remove currentSongFromAlbum = null
            // if song is paused, start song and change icon to pause button
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $playPauseButton.html(playerBarPauseButton);
                currentSoundFile.play();
            } else {
                // if song is not paused, pause song and change content of song number cell
                // and player bar pause button back to play button
                $(this).html(playButtonTemplate);

                $playPauseButton.html(playerBarPlayButton);
                currentSoundFile.pause();
                updateSeekBarWhileSongPlays();
            }
            
        }
        
    };

    var onHover = function(event) {
         var songItem = $(this).find('.song-item-number');
         var songNumber = parseInt(songItem.attr('data-song-number'));
        
         if (songNumber !== currentlyPlayingSongNumber) {
             songItem.html(playButtonTemplate);
            }
    };
    
    var offHover = function(event) {
        var songItem = $(this).find('.song-item-number');
        var songNumber = parseInt(songItem.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songItem.html(songNumber)
        }
    };
    console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // #10
        currentSoundFile.bind('timeupdate', function(event) {
            // #11
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(filterTimeCode(this.getTime()));
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    // #6
  var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        // #3
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // #4
        var seekBarFillRatio = offsetX / barWidth;
        
        // check class of seek bar's parent to determine seek position
        // or volume control
        if ($(this).parent().attr('class') === 'seek-control') {
            // seek to song position using seekBarFillRatio
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            // set volume based on seekBarFillRatio
            setVolume(seekBarFillRatio * 100);
            }
        
        // #5
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    // #7
    $seekBars.find('.thumb').mousedown(function(event) {
        // #8
        var $seekBar = $(this).parent();
        
        // #9
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            // check class of seek bar's parent to determine seek position
            // or volume control
        if ($(this).parent().attr('class') === 'seek-control') {
            // seek to song position using seekBarFillRatio
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            // set volume based on seekBarFillRatio
            setVolume(seekBarFillRatio * 100);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        // #10
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    // assign currently playing song number a new value 
    // based on new song number
    currentlyPlayingSongNumber = songNumber;
    if (songNumber === null) {
        currentSongFromAlbum = null;
    } else {
       currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
       // #1
       currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
           // #2
           formats: [ 'mp3' ],
           preload: true
       });
        
       setVolume(currentVolume);
    }
};

var seek = function(time) {
  if (currentSoundFile) {
      currentSoundFile.setTime(time);
  }  
};
    
var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);

    $playPauseButton.html(playerBarPauseButton);
    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.duration));
};

var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // increment song
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    updatePlayerBarSong();

    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // decrement song
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    updatePlayerBarSong();

    $playPauseButton.html(playerBarPauseButton);

    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');


    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.seek-control .current-time').text(currentTime);
//    $('.seek-control .current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.seek-control .total-time').text(totalTime);
//    $('.seek-control .total-time').text(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
//    var songTime = albumPicasso.songs.duration;
    var time = parseFloat(timeInSeconds);
    
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60);
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
};

var togglePlayFromPlayerBar = function() {
    var currentlyPlayingSongCell = getSongNumberCell(currentlyPlayingSongNumber);
    
    // if song is paused & play button clicked in player bar
    if (currentSoundFile.isPaused()) {
        // play the song
        currentSoundFile.play();
        // change song number cell from play to pause button
        currentlyPlayingSongCell.html(pauseButtonTemplate);
        // change HTML of player bar's play button to pause button
        $playPauseButton.html(playerBarPauseButton);
    } else {
        // pause the song
        currentSoundFile.pause();
        // if song is playing & pause button is clicked
        // change song number cell from pause to play button
        currentlyPlayingSongCell.html(playButtonTemplate);
        // change HTML of player bar's pause button to play button
        $playPauseButton.html(playerBarPlayButton);
    }
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// #1
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

var $volumeFill = $('.volume .fill');
var $volumeThumb = $('.volume .thumb');
$volumeFill.width(currentVolume + '%');
$volumeThumb.css({ left: currentVolume + '%' });

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);
});