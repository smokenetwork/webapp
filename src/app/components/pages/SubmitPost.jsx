import React from 'react';
//import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';
import ReplyEditor from '../elements/ReplyEditor'

import tt from 'counterpart'

const formId = 'submitStory';
// const richTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
// const SubmitReplyEditor = ReplyEditor(formId, richTextEditor);
const SubmitReplyEditor = ReplyEditor(formId);

class SubmitPost extends React.Component {
  // static propTypes = {
  //     routeParams: PropTypes.object.isRequired,
  // }
  constructor() {
    super()
    this.success = (/*operation*/) => {
      // const { category } = operation
      localStorage.removeItem('replyEditorData-' + formId)
      browserHistory.push('/created')//'/category/' + category)
    }
  }

  render() {
    const {success} = this
    return (
      <div>
        <div className="SubmitPost">
          <SubmitReplyEditor type="submit_story" successCallback={success}/>
        </div>
        <div className="row">
          <div className="column post-notify">
            <p>{tt('reply_editor.content_guidelines1')}
            <b><u><a href="https://docs.smoke.io/#/contentguidelines" target="_blank">{tt('reply_editor.content_guidelines2')}</a></u></b>
            {tt('reply_editor.content_guidelines3')}
            <br/><br/>
            <b>{tt('reply_editor.hint')}</b> {tt('reply_editor.content_hint')}
            </p>
            <p><b>{tt('reply_editor.tagbold')}</b>{tt('reply_editor.tag_note')}</p>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = {
  path: 'post',
  component: SubmitPost // connect(state => ({ global: state.global }))(SubmitPost)
};
