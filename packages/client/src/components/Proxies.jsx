import React, { Component } from 'react';
import { Container, Row, Col } from 'react-grid-system';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import sanitizeHtml from 'sanitize-html';
import { SETTINGS_FIELDS, settingsActions } from '../state/actions';
import settingsDefns from '../utils/definitions/settingsDefintions';

import '../styles/proxies.scss';

const MessageBox = styled.div`
  margin: 0 auto;
  margin-top: 30px;
  padding: 20px;
  text-align: center;
  background-color: #edbcc6;
  border-radius: 20px;
  width: 100%;
`;

const Message = styled.span`
  font-weight: 700;
  color: #ef415e;
`;

class Proxies extends Component {
  static sanitize(dirty) {
    return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: [] });
  }

  constructor(props) {
    super(props);

    // ref
    this.domNode = React.createRef();

    // Bind functions
    this.handleUpdate = this.handleUpdate.bind(this);
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
    this.paste = this.paste.bind(this);

    // Set initial state
    this.state = {
      proxies: props.proxies,
      editing: false,
      reduxUpdate: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { reduxUpdate, editing } = this.state;
    // If we are re-rendering due to the proxy action being invoked, update the state and re-render
    if (reduxUpdate && !nextState.reduxUpdate) {
      this.setState({
        proxies: nextProps.proxies,
      });
      return true;
    }

    // re-render only if we are not editing or are changing are editing state
    return !(editing && nextState.editing);
  }

  blur() {
    const { onUpdateProxies } = this.props;
    const { reduxUpdate, proxies } = this.state;
    // Check if we need to call a redux update
    if (reduxUpdate) {
      onUpdateProxies(proxies.map(proxy => proxy.trim()));
    }
    // Force an editing transition to color invalid proxies
    this.setState({
      editing: false,
      reduxUpdate: false,
    });
  }

  focus() {
    // Force an editing transition to not color invalid proxies
    this.setState({
      editing: true,
    });
  }

  paste(e) {
    // Prevent default and event propagation
    e.preventDefault();
    e.stopPropagation();

    // Get the clipboard data and sanitize the text
    const data = e.clipboardData || window.clipboardData;

    const text = Proxies.sanitize(data.getData('text'));

    // Perform the insert using the plain text to mimic the paste
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('paste', false, text);
    }

    // Force an update
    this.handleUpdate(null);
  }

  handleUpdate() {
    // If we don't have the dom node, there's nothing to do here.
    if (!this.domNode.current) return;

    // TODO: Figure out a better way to do this without using innerText
    // Get the new proxies from the domNodes innerText,
    //   then mapping it to sanitized input, then removing empty lines

    const newProxies = this.domNode.current.innerText
      .trim()
      .split('\n')
      .map(proxy => Proxies.sanitize(proxy.trim()))
      .filter(proxy => proxy.length > 0);

    // Update the component state with newProxies and set the reduxUpdate flag
    this.setState({
      proxies: newProxies,
      reduxUpdate: true,
    });
  }

  renderProxies() {
    const { errors } = this.props;
    const { editing, proxies } = this.state;
    // If we don't have any proxies, return an empty list
    if (proxies.length === 0) {
      return '<div><br /></div>';
    }

    // If we are in editing mode, don't apply any styling
    if (editing) {
      return proxies.map(proxy => `<div>${Proxies.sanitize(proxy)}</div>`).join('');
    }
    // Return proxies, styled in red if that proxy is invalid
    return proxies
      .map(
        (proxy, idx) =>
          `<div${errors.includes(idx) ? ' class="invalidProxy"' : ''}>${Proxies.sanitize(
            proxy,
          )}</div>`,
      )
      .join('');
  }

  renderProxyList() {
    const { className } = this.props;
    return React.createElement('div', {
      ref: this.domNode,
      className,
      onInput: this.handleUpdate,
      onFocus: this.focus,
      onBlur: this.blur,
      onPaste: this.paste,
      dangerouslySetInnerHTML: { __html: this.renderProxies() },
      contentEditable: true,
    });
  }

  render() {
    const { proxies } = this.props;
    console.log(proxies);
    return (
      <div className="proxies">
        <Container className="proxies">
          <Row className="announcement">
            <Col sm={12} className="expand">
              <MessageBox>
                Using:
                {` `}
                <Message>{proxies.length}</Message>
                {` `}
                proxies
              </MessageBox>
            </Col>
          </Row>
          <Container className="proxies--container">{this.renderProxyList()}</Container>
        </Container>
      </div>
    );
  }
}

Proxies.propTypes = {
  proxies: settingsDefns.proxies.isRequired,
  errors: settingsDefns.proxyErrors.isRequired,
  className: PropTypes.string,
  onUpdateProxies: PropTypes.func.isRequired,
};

Proxies.defaultProps = {
  className: 'proxies--list',
};

function mapStateToProps(state) {
  const { settings } = state;
  return { proxies: settings.proxies };
}

export const mapDispatchToProps = dispatch => ({
  onUpdateProxies: datum => dispatch(settingsActions.edit(SETTINGS_FIELDS.EDIT_PROXIES, datum)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Proxies);
