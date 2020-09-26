import React, { Component } from 'react';
import { Container } from 'reactstrap';
import sanitizeHTML from 'sanitize-html';
import { v4 as uuid } from 'uuid';
import { setMutationObserver } from './utils'
import StyleSheet from './StyleSheet';

export default class Chat extends Component {


	state = { 
		message: '', 
		postNum: 0, 
		insults: [], 
		insultIndex: 0, 
		posts: 0, 
		isAntagonizing: true,
    tab: 'DEFAULT',
    observer: null
	}

	// computer posting function
	cPost = (text) => {
    const { posts, postNum } = this.state;
    const { cpost_li, cpost_body, cpost_card } = StyleSheet;
		const post = (
			<li key = {uuid()} style={cpost_li}>
				<div className="card" style={cpost_card}>
		      		<div className="card-body" id={`post${postNum}`}
		      			style={cpost_body}
		      			dangerouslySetInnerHTML={{__html: sanitizeHTML(text)}} 
		      		/>
		      	</div>
		    </li>
		);
    this.setState({posts: [post, ...posts], postNum: postNum + 1});
	};

  // @feature : posting to chat function
  // @e       : <event>
	post = (e) => {
		e.preventDefault();
      const { postNum, posts, message } = this.state;
      const { upost_li, upost_card } = StyleSheet;
	    const post = (
			<div key = {"post" + postNum} className="bg-light" style={upost_li}>
				<div className="card bg-light" style={upost_card}>
		     			<div className="card-body" 
		     				id={`post${postNum}`} 
		     				dangerouslySetInnerHTML={{__html: sanitizeHTML(message)}}
		     			/>
		     			
		   		</div>
		  	</div>
	    );

		this.setState({posts: [post, ...posts], postNum: postNum + 1, message: ''});
	}

  componentDidMount() {

    const { insults } = this.state;
    // every twenty seconds antagonize the user
    const self = setInterval(() => {
      const { isAntagonizing, insultIndex } = this.state;
      if(isAntagonizing) {
        this.cPost(insults[insultIndex]);
        this.setState({insultIndex: (insultIndex + 1) % insults.length});
      } else {
        clearInterval(self);
      }
    }, 20000);


    // allow certain unsanitized html tags and attributes
		sanitizeHTML.defaults.allowedTags = [ 'img', 'i', 'b', 'blockquote', 'em',
      'br', 'cite', 'code', 'kbd', 'del', 'font', 'u', 'strong']; 
    sanitizeHTML.defaults.allowedAttributes = 
      { img: ['src', 'alt', 'onerror'], font: ['size', 'color'] };

    // add initial posting to app
    const { cpost_li, cpost_card, cpost_body } = StyleSheet;
    this.setState({posts: [
			<li key ="intro Post" className="bg-light" style={cpost_li}>
				<div className="card" style={cpost_card}>
          <div className="card-body" style={cpost_body} id={`post0`}
            dangerouslySetInnerHTML={{__html: "Click post to send a new message!"}} 
          />
	      </div>
	    </li>
    ]});

    // set mutation observer to watch for nodes added to the DOM
    const observer = setMutationObserver("posts", node => {
      // recursively gather every new node created
      // from the user's input
      function getAllNewNodes(node) {
        const mutations = [];
        function helper(node) {
          mutations.push(node);
          if(node.children !== undefined) {
            Array.from(node.children).forEach(childNode => {
              helper(childNode);
            });
          }
        }
        helper(node);
        return mutations;
      }

      const mutations = getAllNewNodes(node);

      // if a new node was added, gather all the nodes
      // if any of them are images, resize them
      // if one of them is an anchor tag with a href
      // attribute, the user has won

      Array.from(mutations).forEach(mutation => {
        if(mutation.nodeName === 'A' && mutation.href !== undefined) {
          const { observer } = this.state;
          observer.disconnect();
          this.setState({tab: 'VICTORY', antagonize: false, observer: null});
        }
      });

      if(mutations.nodeName === 'IMG') {
        mutations.style = 'max-height: 100%; max-width: 100%';
      } 
    });

    this.setState({observer});
  }

  // @feature : onChange handler
  // @e       : <event>
  onChange = e => {
    this.setState({[e.target.name]: e.target.value});
  }

  render() {
    const { tab, message, posts } = this.state;
    const { main_card, main_title, main_textarea, main_btn, main_ul } = StyleSheet;

    switch(tab) {
      case 'VICTORY':
        return "CONGRATULATIONS :) You hacked challenge 2!";
      default:
        return (
          <Container className='foreground-bg'>
            <div className="card" style={main_card}>
              <div className="card-body secondary-bg text-light">
                <div className="card-title" style={main_title}>
                  LiveChat
                </div>
                <div className='text-success' id="success" />
                <form className="form-group" onSubmit={this.post}>
                  <label className="form-text text-warning" id="invalid"></label>
                  <textarea 
                    placeholder="what's on your mind?" 
                    value={message} 
                    name='message'
                    style={main_textarea} 
                    onChange={this.onChange}
                  />
                  <button 
                    className="btn btn-primary"
                    type="submit" 
                    style={main_btn}
                    >
                    Post</button>
                </form>
                <hr color="lightgray"/>
                <ul id="posts" className='overflow-auto' style={main_ul}>
                  {posts}
                </ul>
              </div>
            </div>
          </Container>
        )
    }
  }
}
