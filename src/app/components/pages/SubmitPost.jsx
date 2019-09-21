import React from 'react';
import {browserHistory} from 'react-router';
import ReplyEditor from '../elements/ReplyEditor'
import ReviewPanel from '../elements/ReviewPanel'

import tt from 'counterpart'

const Tabs = React.createClass({
  getInitialState(){
    return {
      selected:this.props.selected || 0
    }
  },
  render(){
    return (<div>
      <ul>
        {this.props.children.map((elem,index)=>{
          let style = index == this.state.selected ? 'selected': '';
         return <li className="button" style={{marginRight: "20px", width: "20%"}} key={index} onClick={this.handleChange.bind(this,index)}>{elem.props.title}</li>
        })}
      </ul>
      <div>{this.props.children[this.state.selected]}</div>
      </div>
    )
  },
    handleChange(index){
      this.setState({selected:index})
    }
})

const Panel = React.createClass({
  render(){
    return <center><div>{this.props.children}</div></center>
  }
})

const formId = 'submitStory';
// const richTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
// const SubmitReplyEditor = ReplyEditor(formId, richTextEditor);
const SubmitReplyEditor = ReplyEditor(formId);
const SubmitReviewPanel = ReviewPanel(formId);

class SubmitPost extends React.Component {
  // static propTypes = {
  //     routeParams: React.PropTypes.object.isRequired,
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
        <center>
          <Tabs selected={1}>
                <Panel title="Strain Review">
                  <div className="SubmitPost">
                    <SubmitReviewPanel type="submit_story" successCallback={success}/>
                  </div>
                </Panel>
                <Panel title="Blog Post">
                  <div className="SubmitPost">
                    <SubmitReplyEditor type="submit_story" successCallback={success}/>
                  </div>
                </Panel>
          </Tabs>
        </center>
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
