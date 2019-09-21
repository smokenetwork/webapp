import React from 'react';
import reactForm from '../../utils/ReactForm'
import transaction from '../../redux/Transaction';
import MarkdownViewer from '../cards/MarkdownViewer'
import CategorySelector, {validateCategory} from '../cards/CategorySelector'
import LoadingIndicator from './LoadingIndicator'
import shouldComponentUpdate from '../../utils/shouldComponentUpdate'
import Tooltip from './Tooltip'
import sanitizeConfig, {allowedTags} from '../../utils/SanitizeConfig'
import sanitize from 'sanitize-html'
import HtmlReady from '../../../shared/HtmlReady'
import g from '../../redux/GlobalReducer'
import {Set} from 'immutable'
import Remarkable from 'remarkable'
import Dropzone from 'react-dropzone'
import tt from 'counterpart'
import {connect} from 'react-redux';

const remarkable = new Remarkable({html: true, linkify: false, breaks: true})

const RTE_DEFAULT = false

class ReviewPanel extends React.Component {

  static propTypes = {

    // html component attributes
    formId2: React.PropTypes.string.isRequired, // unique form id for each editor
    type: React.PropTypes.oneOf(['submit_story', 'submit_comment', 'edit']),
    successCallback: React.PropTypes.func, // indicator that the editor is done and can be hidden
    onCancel: React.PropTypes.func, // hide editor when cancel button clicked

    author: React.PropTypes.string, // empty or string for top-level post
    permlink: React.PropTypes.string, // new or existing category (default calculated from title)
    parent_author: React.PropTypes.string, // empty or string for top-level post
    parent_permlink: React.PropTypes.string, // new or existing category
    jsonMetadata: React.PropTypes.object, // An existing comment has its own meta data
    category: React.PropTypes.string, // initial value
    title: React.PropTypes.string, // initial value
    body: React.PropTypes.string, // initial value
    effects: React.PropTypes.string, // initial value
    review: React.PropTypes.string, // initial value
    strain_name: React.PropTypes.string, // initial value
    species: React.PropTypes.string, // initial value
    potency: React.PropTypes.string, // initial value
    genetics: React.PropTypes.string, // initial value
    nugporn: React.PropTypes.string, // initial value
    review_tag: React.PropTypes.string, // initial value
    richTextEditor: React.PropTypes.func,
  }

  static defaultProps = {
    isStory: false,
    author: '',
    parent_author: '',
    parent_permlink: '',
    review_tag: '',
    genetics: '<br>Genetics: N/A<br>',
    potency: '<br>Test Results: N/A<br>',
    species: '<br>Species: N/A<br>',
    effects: '<br>Effects: N/A<br>',
    type: 'submit_comment',
  }

  constructor(props) {
    super()
    this.state = {progress: {}}
    this.initForm(props)
    // New ReviewPanel Props are now accessible from here - HnC
    var review = props.review;
    var strain_name = props.strain_name;
    var review_tag = props.review_tag;
    var effects = props.effects;
    var species = props.species;
    var potency = props.potency;
    var nugporn = props.nugporn;
    var genetics = props.genetics;

  }

  componentWillMount() {
    const {setMetaData, formId2, jsonMetadata} = this.props
    setMetaData(formId2, jsonMetadata)

    if (process.env.BROWSER) {
      // Check for rte editor preference
      let rte = this.props.isStory && JSON.parse(localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT);
      let raw = null;

      // Process initial body value (if this is an edit)
      const {review} = this.state
      if (review.value) {
        raw = review.value
      }

      // Check for draft data
      let draft = localStorage.getItem('replyEditorData-' + formId2)
      if (draft) {
        draft = JSON.parse(draft)
        const {category, strain_name} = this.state
        if (category) category.props.onChange(draft.category)
        if (strain_name) strain_name.props.onChange(draft.strain_name)
        raw = draft.review
      }

      // If we have an initial body, check if it's html or markdown
      if (raw) {
        rte = isHtmlTest(raw)
      }

      // console.log("initial reply body:", raw || '(empty)')
      review.props.onChange(raw)
      this.setState({
        rte,
        rte_value: rte ? stateFromHtml(this.props.richTextEditor, raw) : null
      })
      this.setAutoVote()
      this.setState({payoutType: this.props.isStory ? (localStorage.getItem('defaultPayoutType') || '100%') : '100%'})
    }
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.isStory) this.refs.titleRef.focus()
      else if (this.refs.postRef) this.refs.postRef.focus()
      else if (this.refs.rte) this.refs.rte._focus()
    }, 300)
  }

  shouldComponentUpdate = shouldComponentUpdate(this, 'ReplyEditor')

  componentWillUpdate(nextProps, nextState) {
    if (process.env.BROWSER) {
      const ts = this.state
      const ns = nextState

      // Save curent draft to localStorage
      if (ts.review.value !== ns.review.value ||
        (ns.category && ts.category.value !== ns.category.value) ||
        (ns.strain_name && ts.strain_name.value !== ns.strain_name.value)
      ) { // also prevents saving after parent deletes this information
        const {formId2} = nextProps
        const {category, strain_name, review} = ns
        const data = {
          formId2,
          strain_name: strain_name ? strain_name.value : undefined,
          category: category ? category.value : undefined,
          review: review.value,
        }

        clearTimeout(saveEditorTimeout)
        saveEditorTimeout = setTimeout(() => {
          // console.log('save formId2', formId2, body.value)
          localStorage.setItem('replyEditorData-' + formId2, JSON.stringify(data, null, 0))
          this.showDraftSaved()
        }, 500)
      }
    }
  }

  componentWillUnmount() {
    const {clearMetaData, formId2} = this.props
    clearMetaData(formId2)
  }

  initForm(props) {
    const {isStory, type, fields} = props
    const isEdit = type === 'edit'
    const maxKb = isStory ? 100 : 16
    reactForm({
      fields,
      instance: this,
      name: 'replyForm',
      initialValues: props.initialValues,
      validation: values => ({
        title: isStory && (
          !values.title || values.title.trim() === '' ? tt('g.required') :
            values.title.length > 255 ? tt('reply_editor.shorten_title') :
              null
        ),
        strain_name: isStory && (
          !values.strain_name || values.strain_name.trim() === '' ? tt('g.required') :
            values.strain_name.length > 255 ? tt('reply_editor.shorten_title') :
              null
        ),
        category: isStory && validateCategory(values.category, !isEdit),
        review_tag: isStory && validateCategory(values.review_tag, !isEdit),
        review: !values.review ? tt('g.required') :
          values.review.length > maxKb * 1024 ? tt('reply_editor.exceeds_maximum_length', maxKb) :
            null,
        body: !values.body ? tt('g.required') :
          values.body.length > maxKb * 1024 ? tt('reply_editor.exceeds_maximum_length', maxKb) :
            null
      })
    })
  }

  onTitleChange = e => {
    const value = e.target.value
    // TODO block links in title (they do not make good permlinks)
    const hasMarkdown = /(?:\*[\w\s]*\*|\#[\w\s]*\#|_[\w\s]*_|~[\w\s]*~|\]\s*\(|\]\s*\[)/.test(value)
    this.setState({titleWarn: hasMarkdown ? tt('reply_editor.markdown_not_supported') : ''})
    const {strain_name} = this.state
    strain_name.props.onChange(e)
  }

  onCancel = e => {
    if (e) e.preventDefault()
    const {onCancel} = this.props
    const {replyForm, review} = this.state
    if (!review.value || confirm(tt('reply_editor.are_you_sure_you_want_to_clear_this_form'))) {
      replyForm.resetForm()
      this.setAutoVote()
      this.setState({rte_value: stateFromHtml(this.props.richTextEditor)})
      this.setState({progress: {}})
      if (onCancel) onCancel(e)
    }
  }

  autoVoteOnChange = () => {
    const {autoVote} = this.state
    const key = 'replyEditorData-autoVote-story'
    localStorage.setItem(key, !autoVote.value)
    autoVote.props.onChange(!autoVote.value)
  }

  // As rte_editor is updated, keep the (invisible) 'body' field in sync.
  onChange = (rte_value) => {
    this.setState({rte_value})
    const html = stateToHtml(rte_value)
    const {review} = this.state
    if (review.value !== html) review.props.onChange(html);
  }

  setAutoVote() {
    const {isStory} = this.props
    if (isStory) {
      const {autoVote} = this.state
      const key = 'replyEditorData-autoVote-story'
      const autoVoteDefault = JSON.parse(localStorage.getItem(key) || false)
      autoVote.props.onChange(autoVoteDefault)
    }
  }

  toggleRte = (e) => {
    e.preventDefault();
    const state = {rte: !this.state.rte};
    if (state.rte) {
      const {review} = this.state
      state.rte_value = isHtmlTest(review.value) ? stateFromHtml(this.props.richTextEditor, review.value) : stateFromMarkdown(this.props.richTextEditor, review.value)
    }
    this.setState(state);
    localStorage.setItem('replyEditorData-rte', !this.state.rte)
  }

  showDraftSaved() {
    const {draft} = this.refs
    draft.className = 'ReplyEditor__draft'
    void draft.offsetWidth; // reset animation
    draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved'
  }

  onPayoutTypeChange = (e) => {
    const payoutType = e.currentTarget.value
    this.setState({payoutType})
    if (payoutType !== '0%') localStorage.setItem('defaultPayoutType', payoutType)
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (!acceptedFiles.length) {
      if (rejectedFiles.length) {
        this.setState({progress: {error: 'Please insert only image files.'}})
        console.log('onDrop Rejected files: ', rejectedFiles);
      }
      return
    }
    const file = acceptedFiles[0]
    this.upload(file, file.name)
  }

  onOpenClick = () => {
    this.dropzone.open();
  }

  onPasteCapture = e => {
    try {
      if (e.clipboardData) {
        for (const item of e.clipboardData.items) {
          if (item.kind === 'file' && /^image\//.test(item.type)) {
            const blob = item.getAsFile()
            this.upload(blob)
          }
        }
      } else {
        // http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
        // contenteditable element that catches all pasted data
        this.setState({noClipboardData: true})
      }
    } catch (error) {
      console.error('Error analyzing clipboard event', error);
    }
  }

  upload = (file, name = '') => {
    const {uploadImage} = this.props
    this.setState({progress: {message: tt('reply_editor.uploading') + '...'}})
    uploadImage(file, progress => {
      if (progress.url) {
        this.setState({progress: {}})
        const {url} = progress
        const image_md = `![${name}](${url})`
        const {review} = this.state
        const {selectionStart, selectionEnd} = this.refs.postRef
        review.props.onChange(
          review.value.substring(0, selectionStart) +
          image_md +
          review.value.substring(selectionEnd, review.value.length)
        )
      } else {
        this.setState({progress})
      }
      setTimeout(() => {
        this.setState({progress: {}})
      }, 4000) // clear message
    })
  }

  render() {
    const originalPost = {
      category: this.props.category,
      body: this.props.body,
      review_tag: this.props.review_tag,
      review: this.props.review,
    }
    const {onCancel, onTitleChange, autoVoteOnChange} = this
    const {strain_name, category, review, autoVote} = this.state
    const {
      reply, username, isStory, formId2, noImage,
      author, permlink, parent_author, parent_permlink, type, jsonMetadata,
      state, successCallback,
    } = this.props
    const {submitting, valid, handleSubmit} = this.state.replyForm
    const {postError, titleWarn, rte, payoutType} = this.state
    const {progress, noClipboardData} = this.state
    const disabled = submitting || !valid
    const loading = submitting || this.state.loading

    const errorCallback = estr => {
      this.setState({postError: estr, loading: false})
    }
    const successCallbackWrapper = (...args) => {
      this.setState({loading: false})
      if (successCallback) successCallback(args)
    }
    const isEdit = type === 'edit'
    const isHtml = rte || isHtmlTest(review.value)
    // Be careful, autoVote can reset curation rewards.  Never autoVote on edit..
    const autoVoteValue = !isEdit && autoVote.value
    const replyParams = {
      author, permlink, parent_author, parent_permlink, type, state, originalPost, isHtml, isStory,
      jsonMetadata, autoVote: autoVoteValue, payoutType,
      successCallback: successCallbackWrapper, errorCallback
    }
    const postLabel = username ?
      <Tooltip t={tt('g.post_as') + ' “' + username + '”'}>{tt('g.post')}</Tooltip> : tt('g.post')
    const hasTitleError = strain_name && strain_name.touched && strain_name.error
    let titleError = null
    // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
    if ((hasTitleError && (strain_name.error !== tt('g.required') || review.value !== '')) || titleWarn) {
      titleError = <div className={hasTitleError ? 'error' : 'warning'}>
        {hasTitleError ? strain_name.error : titleWarn}&nbsp;
      </div>
    }

    // TODO: remove all references to these vframe classes. Removed from css and no longer needed.
    const vframe_class = isStory ? 'vframe' : '';
    const vframe_section_class = isStory ? 'vframe__section' : '';
    const vframe_section_shrink_class = isStory ? 'vframe__section--shrink' : '';
    const RichTextEditor = this.props.richTextEditor;

    return (
      <div className="ReplyEditor row">

        <div className="column small-12">
          <div ref="draft"
               className="ReplyEditor__draft ReplyEditor__draft-hide">{tt('reply_editor.draft_saved')}</div>
          <form className={vframe_class}
                onSubmit={handleSubmit(({data}) => {
                  const startLoadingIndicator = () => this.setState({loading: true, postError: undefined})
                  reply({...data, ...replyParams, startLoadingIndicator})
                })}
                onChange={() => {
                  this.setState({postError: null})
                }}
          >
            <div className={vframe_section_shrink_class}>
              {isStory && <span>
                                <input
                                  type="text"
                                  className="ReplyEditor__strainName"
                                  disabled={loading}
                                  placeholder="Strain Name"
                                  autoComplete="off"
                                  ref="titleRef"
                                  tabIndex={1}
                                  {...strain_name.props}
                                  />

                                <input
                                    type="text"
                                    className="ReplyEditor__species"
                                    //onChange={onTitleChange}
                                    disabled={loading}
                                    placeholder="Is it Indica, Sativa or Hybrid?"
                                    autoComplete="off"
                                    ref="speciesRef"
                                    tabIndex={2}
                                    />

                                  <input
                                    type="text"
                                    className="ReplyEditor__effects"
                                    //onChange={onTitleChange}
                                    disabled={loading}
                                    placeholder="Genetics/Lineage"
                                    autoComplete="off"
                                    ref="effectsRef"
                                    tabIndex={3}
                                    //{...body.props}
                                    />

                                    <input
                                      type="text"
                                      className="ReplyEditor__effects"
                                      //onChange={onTitleChange}
                                      disabled={loading}
                                      placeholder="What are the effects?"
                                      autoComplete="off"
                                      ref="effectsRef"
                                      tabIndex={3}
                                      //value="test"
                                      //{...effects.props}
                                      />

                                <div className="float-right secondary" style={{marginRight: '1rem'}}>
                                    {rte &&
                                    <a href="#" onClick={this.toggleRte}>{review.value ? 'Raw HTML' : 'Markdown'}</a>}
                                  {!rte && (isHtml || !review.value) &&
                                  <a href="#" onClick={this.toggleRte}>{tt('reply_editor.editor')}</a>}
                                </div>
                {titleError}
                            </span>}
            </div>

            <div
              className={'ReplyEditor__body ' + (rte ? `rte ${vframe_section_class}` : vframe_section_shrink_class)}>
              {process.env.BROWSER && rte ?
                <RichTextEditor ref="rte"
                                readOnly={loading}
                                value={this.state.rte_value}
                                onChange={this.onChange}
                                onBlur={review.onBlur} tabIndex={5}/>
                : <span>
                                    <Dropzone onDrop={this.onDrop}
                                              className={type === 'submit_story' ? 'dropzone' : 'none'}
                                              disableClick multiple={false} accept="image/*"
                                              ref={(node) => {
                                                this.dropzone = node;
                                              }}>
                                        <textarea {...review.props}
                                                  ref="postRef"
                                                  onPasteCapture={this.onPasteCapture}
                                                  className={type === 'submit_story' ? 'upload-enabled' : ''}
                                                  disabled={loading} rows={isStory ? 10 : 3}
                                                  placeholder={isStory ? "Write your review here" + '...' : tt('g.reply')}
                                                  style={{height:"10em"}}
                                                  autoComplete="off"
                                                  tabIndex={5}/>
                                    </Dropzone>
                  {type === 'submit_story' &&
                  <p className="drag-and-drop">
                    {tt('reply_editor.insert_images_by_dragging_dropping')}
                    {noClipboardData ? '' : tt('reply_editor.pasting_from_the_clipboard')}
                    {tt('reply_editor.or_by')} <a
                    onClick={this.onOpenClick}>{tt('reply_editor.selecting_them')}</a>.
                  </p>
                  }
                  {progress.message && <div className="info">{progress.message}</div>}
                  {progress.error &&
                  <div className="error">{tt('reply_editor.image_upload')} : {progress.error}</div>}
                                </span>
              }
            </div>
            <div className={vframe_section_shrink_class}>
              <div
                className="error">{review.touched && review.error && review.error !== 'Required' && review.error}</div>
            </div>

            <div className={vframe_section_shrink_class} style={{marginTop: '0.5rem'}}>
              {isStory && <span>
                                <CategorySelector {...category.props} disabled={loading} isEdit={isEdit} tabIndex={5}/>
                                <div
                                  className="error">{(category.touched || category.value) && category.error}&nbsp;</div>
                            </span>}

            </div>
            <br />
            <div className={vframe_section_shrink_class}>
              {postError && <div className="error">{postError}</div>}
            </div>
            <div className={vframe_section_shrink_class + " desktoponly"}>

              {!loading &&
              <button type="submit" className="button" disabled={disabled}
                      tabIndex={6}>{isEdit ? tt('reply_editor.update_post') : postLabel}</button>
              }
              {loading && <span><br/><LoadingIndicator type="circle"/></span>}
              &nbsp; {!loading && this.props.onCancel &&
            <button type="button" className="secondary hollow button no-border" tabIndex={7}
                    onClick={onCancel}>{tt('g.cancel')}</button>
            }
              {!loading && !this.props.onCancel &&
              <button className="button hollow no-border" tabIndex={7} disabled={submitting}
                      onClick={onCancel}>{tt('g.clear')}</button>}
              {isStory && !isEdit && <div className="ReplyEditor__options float-right text-right">

                {tt('g.rewards')} &nbsp;
                <select value={this.state.payoutType} onChange={this.onPayoutTypeChange}
                        style={{color: this.state.payoutType == '0%' ? 'orange' : ''}}>
                  <option value="100%">{tt('reply_editor.power_up_100')}</option>
                  <option value="0%">{tt('reply_editor.decline_payout')}</option>
                </select>

                <br/>
                <label title={tt('reply_editor.check_this_to_auto_upvote_your_post')}>
                  {tt('g.upvote_post')} &nbsp;
                  <input type="checkbox" checked={autoVote.value} onChange={autoVoteOnChange}/>
                </label>
              </div>}
            </div>
            <div>
              <div className="submitMobile">
                {!loading &&
                <button type="submit" className="button" disabled={disabled}
                        tabIndex={6}>{isEdit ? tt('reply_editor.update_post') : postLabel}</button>
                }
                {loading && <span><br/><LoadingIndicator type="circle"/></span>}
                &nbsp; {!loading && this.props.onCancel &&
              <button type="button" className="secondary hollow button no-border" tabIndex={5}
                      onClick={onCancel}>{tt('g.cancel')}</button>
              }
                {!loading && !this.props.onCancel &&
                <button className="button hollow no-border" tabIndex={7} disabled={submitting}
                        onClick={onCancel}>{tt('g.clear')}</button>}
              </div>
            </div>
            {!loading && !rte && review.value && <div className={'Preview ' + vframe_section_shrink_class}>
              {!isHtml && <div className="float-right">
                <a target="_blank" href="https://guides.github.com/features/mastering-markdown/"
                   rel="noopener noreferrer">
                  {tt('reply_editor.markdown_styling_guide')}
                </a>
              </div>}
              <h6>{tt('g.preview')}</h6>
              <MarkdownViewer formId2={formId2} text={review.value} canEdit jsonMetadata={jsonMetadata}
                              large={isStory} noImage={noImage}/>
            </div>}
          </form>
        </div>
      </div>
    )
  }
}

let saveEditorTimeout

// removes <html></html> wrapper if exists
function stripHtmlWrapper(text) {
  const m = text.match(/<html>\n*([\S\s]+?)?\n*<\/html>/m);
  return m && m.length === 2 ? m[1] : text;
}

// See also MarkdownViewer render
const isHtmlTest = text => /^<html>/.test(text)

function stateToHtml(state) {
  let html = state.toString('html');
  if (html === '<p></p>') html = '';
  if (html === '<p><br></p>') html = '';
  if (html == '') return ''
  return `<html>\n${html}\n</html>`;
}

function stateFromHtml(RichTextEditor, html = null) {
  if (!RichTextEditor) return null;
  if (html) html = stripHtmlWrapper(html)
  if (html && html.trim() == '') html = null
  return html ? RichTextEditor.createValueFromString(html, 'html')
    : RichTextEditor.createEmptyValue()
}

function stateFromMarkdown(RichTextEditor, markdown) {
  let html
  if (markdown && markdown.trim() !== '') {
    html = remarkable.render(markdown)
    html = HtmlReady(html).html // TODO: option to disable youtube conversion, @-links, img proxy
    //html = htmlclean(html) // normalize whitespace
    console.log("markdown converted to:", html)
  }
  return stateFromHtml(RichTextEditor, html)
}

const richTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;

export default (formId2) => connect(
  // mapStateToProps
  (state, ownProps) => {
    const username = state.user.getIn(['current', 'username'])
    const fields = ['review', 'autoVote:checked']
    const {type, parent_author, jsonMetadata} = ownProps
    const isEdit = type === 'edit'
    const isStory = /submit_story/.test(type) || (
      isEdit && parent_author === ''
    )
    if (isStory) fields.push('strain_name')
    if (isStory) fields.push('category')

    let {category, strain_name, review} = ownProps
    if (/submit_/.test(type)) strain_name = review = ''
    if (isStory && jsonMetadata && jsonMetadata.tags) {
      category = Set([category, ...jsonMetadata.tags]).join(' ')
    }
    const ret = {
      ...ownProps,
      fields, isStory, username,
      initialValues: {strain_name, review, category}, state,
      formId2, richTextEditor,
    }
    return ret
  },

  // mapDispatchToProps
  dispatch => ({
    clearMetaData: (id) => {
      dispatch(g.actions.clearMeta({id}))
    },
    setMetaData: (id, jsonMetadata) => {
      dispatch(g.actions.setMetaData({id, meta: jsonMetadata ? jsonMetadata.steem : null}))
    },
    uploadImage: (file, progress) => {
      dispatch({
        type: 'user/UPLOAD_IMAGE',
        payload: {file, progress},
      })
    },
    reply: ({
              category, strain_name, review, author, permlink, parent_author, parent_permlink, isHtml, isStory,
              type, originalPost, autoVote = false, payoutType = '100%',
              state, jsonMetadata,
              successCallback, errorCallback, startLoadingIndicator
            }) => {
      // const post = state.global.getIn(['content', author + '/' + permlink])
      const username = state.user.getIn(['current', 'username'])

      const isEdit = type === 'edit'
      const isNew = /^submit_/.test(type)

      // Wire up the current and parent props for either an Edit or a Submit (new post)
      //'submit_story', 'submit_comment', 'edit'
      const linkProps =
        isNew ? { // submit new
            parent_author: author,
            parent_permlink: permlink,
            author: username,
            // permlink,  assigned in TransactionSaga
          } :
          // edit existing
          isEdit ? {author, permlink, parent_author, parent_permlink}
            : null

      if (!linkProps) throw new Error('Unknown type: ' + type)

      // If this is an HTML post, it MUST begin and end with the tag
      if (isHtml && !review.match(/^<html>[\s\S]*<\/html>$/)) {
        errorCallback('HTML posts must begin with <html> and end with </html>')
        return
      }

      let rtags
      {
        const html = isHtml ? review : remarkable.render(review)
        rtags = HtmlReady(html, {mutate: false})
      }

      allowedTags.forEach(tag => {
        rtags.htmltags.delete(tag)
      })
      if (isHtml) rtags.htmltags.delete('html') // html tag allowed only in HTML mode
      if (rtags.htmltags.size) {
        errorCallback('Please remove the following HTML elements from your post: ' + Array(...rtags.htmltags).map(tag => `<${tag}>`).join(', '))
        return
      }

      const formCategories = Set(category ? category.trim().replace(/#/g, "").split(/ +/) : [])
      const rootCategory = originalPost && originalPost.category ? originalPost.category : formCategories.first()
      let allCategories = Set([...formCategories.toJS()])
      if (/^[-a-z\d]+$/.test(rootCategory)) allCategories = allCategories.add(rootCategory)

      let postHashtags = [...rtags.hashtags]
      while (allCategories.size < 5 && postHashtags.length > 0) {
        allCategories = allCategories.add(postHashtags.shift())
      }

      // merge
      const meta = isEdit ? jsonMetadata : {}
      if (allCategories.size) meta.tags = allCategories.toJS(); else delete meta.tags
      if (rtags.usertags.size) meta.users = rtags.usertags; else delete meta.users
      if (rtags.images.size) meta.image = rtags.images; else delete meta.image
      if (rtags.links.size) meta.links = rtags.links; else delete meta.links

      meta.app = "smoke/0.1"
      if (isStory) {
        meta.format = isHtml ? 'html' : 'markdown'
      }

      // if(Object.keys(json_metadata.steem).length === 0) json_metadata = {}// keep json_metadata minimal
      const sanitizeErrors = []
      sanitize(review, sanitizeConfig({sanitizeErrors}))
      if (sanitizeErrors.length) {
        errorCallback(sanitizeErrors.join('.  '))
        return
      }

      if (meta.tags.length > 5) {
        const includingCategory = isEdit ? tt('reply_editor.including_the_category', {rootCategory}) : ''
        errorCallback(tt('reply_editor.use_limited_amount_of_tags', {
          tagsLength: meta.tags.length,
          includingCategory
        }))
        return
      }

      startLoadingIndicator()

      const originalBody = isEdit ? originalPost.review : null
      const __config = {originalBody, autoVote}

      // Avoid changing payout option during edits #735
      if (!isEdit) {
        switch (payoutType) {
          case '0%': // decline payout
            __config.comment_options = {
              max_accepted_payout: '0.000 SMOKE',
            }
            break;
          default: // 100% steem power payout
        }
      }

      const operation = {
        ...linkProps,
        category: rootCategory, strain_name, review,
        json_metadata: meta,
        __config
      }
      dispatch(transaction.actions.broadcastOperation({
        type: 'comment',
        operation,
        errorCallback,
        successCallback,
      }))
    },
  })
)(ReviewPanel)
