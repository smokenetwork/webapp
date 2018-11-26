/* eslint react/prop-types: 0 */
import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {browserHistory} from 'react-router';



class TagTabs extends Component {

  constructor(){
    super()
    this.scroll = this.scroll.bind(this)
  }

  scroll(direction){
    let far = $( '.image-container' ).width()/2*direction;
    let pos = $('.image-container').scrollLeft() + far;
    $('.image-container').animate( { scrollLeft: pos }, 1000)
  } our

  navigate = (e) => {
    const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
    // this.setState({open: null});
    if (a.host !== window.location.host) return;
    e.preventDefault();
    browserHistory.push(a.pathname + a.search + a.hash);

  };



  render() {
    return (

      <div className="tag-wrap">
        <div className="">
          <div className="image-container">
            <a href="/" onClick={this.navigate} className="image tagboxes you">FOR YOU</a>
            <a href="../trending/life" onClick={this.navigate} className="image tagboxes cannabis">LIFE</a>
            <a href="../trending/grow" onClick={this.navigate} className="image tagboxes growing">GROW</a>
            <a href="../trending/edibles" onClick={this.navigate} className="image tagboxes edibles">EDIBLES</a>
            <a href="../trending/nugporn" onClick={this.navigate} className="image tagboxes strains">NUGPORN</a>
            <a href="../trending/art" onClick={this.navigate} className="image tagboxes art">ART</a>
            <a href="../trending/news" onClick={this.navigate} className="image tagboxes news">NEWS</a>
            <a href="../trending/contest" onClick={this.navigate} className="image tagboxes contest">CONTEST</a>
            <a href="../trending/cbd" onClick={this.navigate} className="image tagboxes cbd">CBD</a>
            <a href="../trending/health" onClick={this.navigate} className="image tagboxes health">HEALTH</a>
            <a href="../trending/dabs" onClick={this.navigate} className="image tagboxes dabs">DABS</a>
            <a href="../trending/legalize" onClick={this.navigate} className="image tagboxes legalize">LEGALIZE</a>
            <a href="../trending/nsfw" onClick={this.navigate} className="image tagboxes nsfw">NSFW</a>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  // mapStateToProps
)(TagTabs)
