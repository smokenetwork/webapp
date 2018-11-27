/* eslint react/prop-types: 0 */
import React, {Component} from 'react';
import {browserHistory, Link} from 'react-router';
import {connect} from 'react-redux';
import tt from 'counterpart';

const default_fixed_tags = ['life', 'grow', 'edibles', 'nugporn', 'art', 'news', 'contest', 'cbd', 'health', 'dabs', 'legalize', 'nsfw'];

class TagTabs extends Component {
  constructor(){
    super()
    // this.scroll = this.scroll.bind(this)
  }

  // componentDidMount() {
  //   window.addEventListener('scroll', this.handleScroll);
  // }
  //
  // componentWillUnmount() {
  //   window.removeEventListener('scroll', this.handleScroll);
  // }
  //
  //
  // handleScroll = (direction) => {
  //   let far = $( '.image-container' ).width()/2*direction;
  //   let pos = $('.image-container').scrollLeft() + far;
  //   $('.image-container').animate( { scrollLeft: pos }, 1000)
  // };

  render() {
    const render_tags = default_fixed_tags.map((tag) =>
      <Link key={`tag_${tag}`} to={`/trending/${tag}`} className={`image tagboxes ${tag}`}>{tag}</Link>
    );

    return (
      <div className="tag-wrap">
        <div className="image-container">
          <Link to="/" className="image tagboxes you">{tt('g.for_you')}</Link>
          {render_tags}
        </div>
      </div>
    )
  }
}

export default connect(
  // mapStateToProps
)(TagTabs)
