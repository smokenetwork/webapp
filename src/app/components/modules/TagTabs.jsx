/* eslint react/prop-types: 0 */
import React, {Component} from 'react';
import {browserHistory, Link} from 'react-router';
import {connect} from 'react-redux';
import tt from 'counterpart';

class TagTabs extends Component {
  constructor(){
    super()
    // this.scroll = this.scroll.bind(this)
  }

  scroll = (direction) => {
    let far = $( '.image-container' ).width()/2*direction;
    let pos = $('.image-container').scrollLeft() + far;
    $('.image-container').animate( { scrollLeft: pos }, 1000)
  };

  render() {
    return (
      <div className="tag-wrap">
        <div className="">
          <div className="image-container">
            <Link to="/" className="image tagboxes you">{tt('g.for_you')}</Link>
            <Link to="/trending/life" className="image tagboxes cannabis">LIFE</Link>
            <Link to="/trending/grow" className="image tagboxes growing">GROW</Link>
            <Link to="/trending/edibles" className="image tagboxes edibles">EDIBLES</Link>
            <Link to="/trending/nugporn" className="image tagboxes strains">NUGPORN</Link>
            <Link to="/trending/art" className="image tagboxes art">ART</Link>
            <Link to="/trending/news" className="image tagboxes news">NEWS</Link>
            <Link to="/trending/contest" className="image tagboxes contest">CONTEST</Link>
            <Link to="/trending/cbd" className="image tagboxes cbd">CBD</Link>
            <Link to="/trending/health" className="image tagboxes health">HEALTH</Link>
            <Link to="/trending/dabs" className="image tagboxes dabs">DABS</Link>
            <Link to="/trending/legalize" className="image tagboxes legalize">LEGALIZE</Link>
            <Link to="/trending/nsfw" className="image tagboxes nsfw">NSFW</Link>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  // mapStateToProps
)(TagTabs)
