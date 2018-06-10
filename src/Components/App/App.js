import React, { Component } from 'react';
import './App.css';
import {SearchResults} from "../SearchResults/SearchResults";
import {SearchBar} from "../SearchBar/SearchBar";
import {Playlist} from "../Playlist/Playlist";
import {Spotify} from "../../util/Spotify";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchResults: [],
            playlistTracks: [],
            playlistName: "New Playlist"
        };

        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
        this.spotify = new Spotify();
    }

    addTrack(track) {
        if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
            return;
        }
        this.setState({ playlistTracks: this.state.playlistTracks.concat(track) });
    }

    removeTrack(track) {
        this.setState({ playlistTracks: this.state.playlistTracks.filter(savedTrack => savedTrack.id !== track.id) });
    }

    updatePlaylistName(name) {
        this.setState({ playlistName: name });
    }

    savePlaylist() {
        let trackURIs = this.state.playlistTracks.map(track => track.uri);
        this.spotify.savePlaylist(this.state.playlistName, trackURIs);
        this.setState({ playlistName: 'New Playlist' });
    }

    search(searchTerm) {
        this.setState({ searchResults: this.spotify.search(searchTerm) });
    }

  render() {
    return (
        <div>
            <h1>Ja<span className="highlight">mmm</span>ing</h1>
            <div className="App">
                <SearchBar onSearch={this.search}/>
                <div className="App-playlist">
                    <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack}/>
                    <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks}
                              onRemove={this.removeTrack} onNameChanged={this.updatePlaylistName}
                              onSave={this.savePlaylist} />
                </div>
            </div>
        </div>
    );
  }
}

export default App;
