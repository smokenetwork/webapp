import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import Remarkable from 'remarkable'
import YoutubePreview from '../elements/YoutubePreview'
import sanitizeConfig, {noImageText} from '../../utils/SanitizeConfig'
import sanitize from 'sanitize-html'
import HtmlReady from '../../../shared/HtmlReady'
import tt from 'counterpart';

const remarkable = new Remarkable({
  html: true, // remarkable renders first then sanitize runs...
  breaks: true,
  linkify: false, // linkify is done locally
  typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
  quotes: '“”‘’'
})

class MarkdownViewer extends Component {
  static propTypes = {
    // HTML properties
    text: PropTypes.string,
    className: PropTypes.string,
    large: PropTypes.bool,
    // formId: PropTypes.string, // This is unique for every editor of every post (including reply or edit)
    canEdit: PropTypes.bool,
    jsonMetadata: PropTypes.object,
    highQualityPost: PropTypes.bool,
    noImage: PropTypes.bool,
    allowDangerousHTML: PropTypes.bool,
    hideImages: PropTypes.bool,
    showDefaultImage: PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    large: false,
    allowDangerousHTML: false,
    hideImages: false,
    showDefaultImage: false,
  }

  constructor() {
    super()
    this.state = {allowNoImage: true}
  }

  shouldComponentUpdate(np, ns) {
    return np.text !== this.props.text ||
      np.large !== this.props.large ||
      // np.formId !== this.props.formId ||
      np.canEdit !== this.props.canEdit ||
      ns.allowNoImage !== this.state.allowNoImage
  }

  onAllowNoImage = () => {
    this.setState({allowNoImage: false})
  }

  render() {
    const {noImage, hideImages, showDefaultImage} = this.props
    const {allowNoImage} = this.state
    let {text} = this.props
    if (!text) text = '' // text can be empty, still view the link meta data
    const {large, /*formId, canEdit, jsonMetadata,*/ highQualityPost} = this.props

    let html = false;
    // See also ReplyEditor isHtmlTest
    const m = text.match(/^<html>([\S\s]*)<\/html>$/);
    if (m && m.length === 2) {
      html = true;
      text = m[1];
    } else {
      // See also ReplyEditor isHtmlTest
      html = /^<p>[\S\s]*<\/p>/.test(text)
    }

    // Strip out HTML comments. "JS-DOS" bug.
    text = text.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)')

    let renderedText = html ? text : remarkable.render(text)

    // Embed videos, link mentions and hashtags, etc...
    if (renderedText) renderedText = HtmlReady(renderedText, {hideImages, showDefaultImage}).html

    // Complete removal of javascript and other dangerous tags..
    // The must remain as close as possible to dangerouslySetInnerHTML
    let cleanText = renderedText
    if (this.props.allowDangerousHTML === true) {
      console.log('WARN\tMarkdownViewer rendering unsanitized content')
    } else {
      cleanText = sanitize(renderedText, sanitizeConfig({
        large,
        highQualityPost,
        noImage: noImage && allowNoImage
      }))
    }

    if (/<\s*script/ig.test(cleanText)) {
      // Not meant to be complete checking, just a secondary trap and red flag (code can change)
      console.error('Refusing to render script tag in post text', cleanText)
      return <div/>
    }

    const noImageActive = cleanText.indexOf(noImageText) !== -1

    // In addition to inserting the youtube compoennt, this allows react to compare separately preventing excessive re-rendering.
    let idx = 0
    const sections = []

    // HtmlReady inserts ~~~ embed:${id} type ~~~
    for (let section of cleanText.split('~~~ embed:')) {
      const match = section.match(/^([A-Za-z0-9\?\=\_\-\/\.]+) (youtube|vimeo|twitch|spotify|spotifyLarge|dtube)\s?(\d+)? ~~~/)
      if (match && match.length >= 2) {
        const id = match[1]
        const type = match[2]
        const startTime = match[3] ? parseInt(match[3]) : 0;
        const w = large ? 640 : 480,
          h = large ? 360 : 270
        if (type === 'youtube') {
          sections.push(
            <YoutubePreview
              key={idx++}
              width={w}
              height={h}
              youTubeId={id}
              startTime={startTime}
              frameBorder="0"
              allowFullScreen="true"/>
          )
        } else if (type === 'vimeo') {
          const url = `https://player.vimeo.com/video/${id}#t=${
              startTime
          }s`;
          sections.push(
            <div key={idx++} className="videoWrapper">
              <iframe
                key={idx++}
                src={url}
                width={w}
                height={h}
                frameBorder="0"
                allowFullScreen/>
            </div>
          )
        }
        else if (type === 'spotify') {
          const spotifyURL = `https://open.spotify.com/embed/${id}`
          sections.push(
            <div key={idx++} className="spotifyTrackWrapper">
              <iframe
                key={idx++}
                src={spotifyURL}
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                />
            </div>
          )
        }
        else if (type === 'spotifyLarge') {
          const spotifyURL = `https://open.spotify.com/embed/${id}`
          sections.push(
            <div key={idx++} className="spotifyPlaylistWrapper">
              <iframe
                key={idx++}
                src={spotifyURL}
                frameBorder="0"
                allowTransparency="true"
                />
            </div>
          )
        } else if (type === 'twitch') {
          const url = `https://player.twitch.tv/${id}`;
          sections.push(
              <div className="videoWrapper">
                  <iframe
                      key={idx++}
                      src={url}
                      width={w}
                      height={h}
                      frameBorder="0"
                      allowFullScreen
                  />
              </div>
          );
        } else if (type === 'dtube') {
          const url = `https://emb.d.tube/#!/${id}`;
          sections.push(
              <div className="videoWrapper">
                  <iframe
                      key={idx++}
                      src={url}
                      width={w}
                      height={h}
                      frameBorder="0"
                      allowFullScreen
                  />
              </div>
          );
        } else {
          console.error('MarkdownViewer unknown embed type', type);
        }
        if (match[3]) {
            section = section.substring(
                `${id} ${type} ${startTime} ~~~`.length
            );
        } else {
            section = section.substring(`${id} ${type} ~~~`.length);
        }
        if (section === '') continue
      }
      sections.push(<div key={idx++} dangerouslySetInnerHTML={{__html: section}}/>)
    }

    const cn = 'Markdown' + (this.props.className ? ` ${this.props.className}` : '') + (html ? ' html' : '') + (large ? '' : ' MarkdownViewer--small')
    return (<div className={"MarkdownViewer " + cn}>
      {sections}
      {noImageActive && allowNoImage &&
      <div onClick={this.onAllowNoImage} className="MarkdownViewer__negative_group">
        {tt('markdownviewer_jsx.images_were_hidden_due_to_low_ratings')}
        <button style={{marginBottom: 0}} className="button hollow tiny float-right">{tt('g.show')}</button>
      </div>
      }
    </div>)
  }
}

export default connect(
  (state, ownProps) => {
    return {...ownProps}
  }
)(MarkdownViewer)
