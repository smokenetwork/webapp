import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import Icon from './Icon';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate'
import tt from 'counterpart';

class VotesAndComments extends React.Component {

  static propTypes = {
    // HTML properties
    post: PropTypes.string.isRequired,
    commentsLink: PropTypes.string.isRequired,

    // Redux connect properties
    votes: PropTypes.number,
    comments: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'VotesAndComments');
  }

  render() {
    const {votes, comments, commentsLink} = this.props;
    let comments_tooltip = tt('votesandcomments_jsx.no_responses_yet_click_to_respond');
    if (comments > 0) comments_tooltip = tt('votesandcomments_jsx.response_count_tooltip', {count: comments});

    return (
      <span className="VotesAndComments">
                <span className={'VotesAndComments__comments' + (comments === 0 ? ' no-comments' : '')}>
                     <Link to={commentsLink} title={comments_tooltip}>
                        <Icon name={comments > 1 ? 'chatboxes' : 'chatbox'}/>&nbsp;{comments}
                     </Link>
                 </span>
                <span className="VotesAndComments__votes" title={tt('votesandcomments_jsx.vote_count', {count: votes})}>
                    <Icon size="1x" name="flame"/>&nbsp;{votes}
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
      votes: post.get('net_votes'),
      comments: post.get('children')
    };
  }
)(VotesAndComments);
