/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);   
            this.model.view.updateTitle(this.model.getList(newList.id).getName())         
            this.model.loadList(newList.id);
            this.model.saveLists();
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

        document.getElementById("close-button").onmousedown = (event) => {
            this.model.close();
        }
        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);
            item.draggable = "true";

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                        this.model.restoreList();
                    }
                }
            }

            item.ondragstart = (event) => {
                event.dataTransfer.setData("text", event.target.id);
                event.dataTransfer.setData("id", event.target.id);
            }

            item.ondragover = (event) => {
                event.preventDefault();
            }

            item.ondrop = (event) => {
                event.preventDefault();
                let oldId = event.dataTransfer.getData("id");
                this.model.addMoveItemTransaction(oldId, event.target.id);
                this.model.saveLists();
                this.model.view.updateToolbarButtons(this.model);
            }
        }
    }

    deleteList(id){
            let allLists = this.model.top5Lists;
            allLists.splice(id, 1);
            this.model.sortLists();
            this.model.close();
            this.model.saveLists();
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll(); 
            this.model.view.disableButton("add-list-button");

            // GET THE SELECTED LIST
            let listName = this.model.getList(id).getName();
            this.model.loadList(id);
            this.model.view.enableButton("close-button");  
            this.model.view.updateTitle(listName);   
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                let modal = document.getElementById("delete-modal");
                modal.classList.remove("is-visible");
                this.deleteList(id);
            }

            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                let modal = document.getElementById("delete-modal");
                modal.classList.remove("is-visible");
            }
        }

        let thisList = document.getElementById("top5-list-" + id);

            // AND FOR TEXT EDITING
        thisList.ondblclick = (ev) => {
            // CLEAR THE TEXT
            thisList.innerHTML = "";

            // ADD A TEXT FIELD
            let textInput = document.createElement("input");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "list-text-input-" + id);
            textInput.setAttribute("value", this.model.getList(id).getName());

            thisList.appendChild(textInput);

            
            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    if (event.target.value.replace(/\s+/g, "") === ""){
                        this.model.getList(id).setName("Untitled");
                    }
                    else{
                        this.model.getList(id).setName(event.target.value);
                    }   
                    this.model.view.updateTitle(this.model.getList(id).getName());
                    this.model.sortLists();
                    this.model.saveLists();
                }
            }
            textInput.onblur = (event) => {
                if (event.target.value.replace(/\s+/g, "") === ""){
                    this.model.getList(id).setName("Untitled");
                }
                else{
                    this.model.getList(id).setName(event.target.value);
                }
                this.model.sortLists();
                this.model.saveLists();
            }
        }
    }
    
    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}