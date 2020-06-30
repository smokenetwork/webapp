/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM, {findDOMNode} from 'react-dom';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate'
import Icon from './Icon';
import {Link} from 'react-router';
import AuthorDropdown from './AuthorDropdown';
import Reputation from './Reputation';
import Follow from './Follow';
import normalizeProfile from '../../utils/NormalizeProfile';
import Overlay from 'react-overlays/lib/Overlay';
import {connect} from 'react-redux'


import PostsGrid from '../cards/PostsGrid';

const {string, bool, number} = PropTypes;

const closers = [];

const fnCloseAll = () => {
  var close;
  while (close = closers.shift()) {
    close();
  }
}

class AuthorFeatured extends React.Component {
  static propTypes = {
    author: string.isRequired,
    follow: bool,
    mute: bool,
    authorRepLog10: number,
  };
  static defaultProps = {
    follow: true,
    mute: true
  };

  constructor(...args) {
    super(...args);
    this.state = {show: false};
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    if (!this.authorProfileLink) {
      return;
    }
    const node = ReactDOM.findDOMNode(this.authorProfileLink);
    if (node.addEventListener) {
      node.addEventListener('click', this.toggle, false);
    } else {
      node.attachEvent('click', this.toggle, false);
    }
  }

  componentWillUnmount() {
    if (!this.authorProfileLink) {
      return;
    }
    const node = ReactDOM.findDOMNode(this.authorProfileLink);
    if (node.removeEventListener) {
      node.removeEventListener('click', this.toggle);
    } else {
      node.detachEvent('click', this.toggle);
    }
  }

  toggle = (e) => {
    if (!(e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      const show = !this.state.show;
      fnCloseAll();
      if (show) {
        this.setState({show})
        closers.push(this.close)
      }
    }
  }

  close = () => {
    this.setState({
      show: false
    });
  }

  shouldComponentUpdate = shouldComponentUpdate(this, 'Author');

  render() {
    const {author, follow, mute, authorRepLog10} = this.props; // html
    const {username} = this.props; // redux
    const {name, about} = this.props.account ? normalizeProfile(this.props.account.toJS()) : {};

    if (!(follow || mute) || username === author) {
      return (
        <span className="author" itemProp="author" itemScope itemType="http://schema.org/Person">
                    <strong><Link to={'/@' + author}>{author}</Link></strong> <Reputation value={authorRepLog10}/>
                </span>
      );
    }

    return (
      <div className="Author">
        <div itemProp="author" itemScope itemType="http://schema.org/Person">
          <div>
            <Link to={'/@' + author} className="Author__name">
              {name}<span><Reputation value={authorRepLog10}/></span>
            </Link>
          </div>
          <div>
            <Link className="ptc Author__username" to={'/@' + author}>@{author}

            </Link>
          </div>
          <div className="Author__bio">
            {about}
          </div>
          <div>
            <Follow className="float-right" follower={username} following={author} what="blog"
                    showFollow={follow} showMute={mute}/>
          </div>


        </div>


      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const {author, follow, mute, authorRepLog10} = ownProps;
    const username = state.user.getIn(['current', 'username']);
    const account = state.global.getIn(['accounts', author]);
    return {
      author, follow, mute, authorRepLog10,
      username,
      account,
    }
  },
)(AuthorFeatured)
