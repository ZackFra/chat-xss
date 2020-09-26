
// sets the mutationObserver, and calls
// onMutation when the sub-DOM is modified
// onMutation is a callback that respoonds to changes
export const setMutationObserver = (id, onMutation) => {

	const rootNode = document.getElementById(id);

	const mutationObserver = new MutationObserver(mutations => {
	    mutations.forEach(mutation => {
	    	const newNodes = mutation.addedNodes;
	        newNodes.forEach(node => {
	        	onMutation(node);
	        })
	    })
	});

	mutationObserver.observe(rootNode, {
	    attributes: true,
	    characterData: false,
	    childList: true,
	    subtree: true,
	    attributeOldValue: false,
	    characterDataOldValue: false
	});

	return mutationObserver;
}