import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import Icon from './Icon';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate'
import tt from 'counterpart';

class Comments extends React.Component {
  static propTypes = {
    // HTML properties
    post: PropTypes.string.isRequired,
    commentsLink: PropTypes.string.isRequired,
    comments: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'VotesAndComments');
  }

  render() {
    const {comments, commentsLink} = this.props;
    let comments_tooltip = tt('votesandcomments_jsx.no_responses_yet_click_to_respond');
    if (comments > 0) comments_tooltip = tt('votesandcomments_jsx.response_count_tooltip', {count: comments});

    return (
      <span className="VotesAndComments">
                <span className={'VotesAndComments__comments' + (comments === 0 ? ' no-comments' : '')}>
                     <Link to={commentsLink} title={comments_tooltip}>
                        <Icon name={comments > 1 ? 'chatboxes' : 'chatbox'}/>&nbsp;{comments}
                     </Link>
                 </span>
            </span>
    );
  }
}

export default connect(
  (state, props) => {
    const post = state.global.getIn(['content', props.post]);
    if (!post) return props;
    return {
      ...props,
      comments: post.get('children')
    };
  }
)(Comments);
