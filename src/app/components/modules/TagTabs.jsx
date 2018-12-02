/* eslint react/prop-types: 0 */
import React, {Component} from 'react';
import {browserHistory, Link} from 'react-router';
import {connect} from 'react-redux';
import tt from 'counterpart';
import ScrollMenu from '../elements/ScrollMenu';

class TagTabs extends Component {
  constructor(){
    super();
  }

  render() {
    const render_tags = $STM_Config.default_fixed_tags.map((tag) =>
      <div key={`tag_${tag}`} className={`image tagboxes ${tag}`}>
        <h2><Link to={`/trending/${tag}`}>{tag}</Link></h2>
      </div>
    );

    return (
      <ScrollMenu data={render_tags} dragging={true}
                  wheel={false} alignCenter={false} hideArrows={true}
                  menuClass="tag-wrap" wrapperClass="image-container"
      />
    )
  }
}

export default connect(
  // mapStateToProps
)(TagTabs)
