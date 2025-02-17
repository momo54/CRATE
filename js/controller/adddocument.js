

function AddDocument(viewAction, viewModal, viewDocuments){
    var self = this;
    this.connectionOptions = null;
    this.viewModal = viewModal;
    this.viewDocuments = viewDocuments;

    // #1 bind the add button to its action
    viewAction.button.unbind('click');
    viewAction.button.attr('data-toggle', 'modal')
        .attr('data-target', '#'+ viewModal.modal.attr('id'));
    // #2 initial state
    viewAction.button.click(function(){
        viewModal.initialState();
    });
    // #3 user chooses to create a new document
    viewModal.newDocument.click(function(){
        viewModal.newDocumentState();
    });
    // #4 user chooses to open a document
    viewModal.openFileButton.change(function(evt){
        var file = evt.target.files[0], // only one file
            reader = new FileReader();

        reader.onloadend = (function(file) {
            return function(e) {
                var object = JSON.parse(e.target.result);
                if (object){
                    self.justDoIt(null, null, object);
                };
                viewModal.dismissOpenFileButton[0].click();
            };
        })(file);        
        reader.readAsText(file);
        this.value = null;
    });
    // #5 user chooses to join an editing session
    viewModal.joinEditingSession.click(function(){
        viewModal.joinEditingSessionState();
    });
    
    viewModal.confirmNewDocument.click(function(){
        self.justDoIt(null, viewModal.inputName.val());
    });

    viewModal.confirmJoining.click(function(){
        var val = viewModal.inputJoining.val();

        // TODO: make it configurable:
        // server: val.split('/index.html?')[0],
        self.justDoIt({server:  'https://ancient-shelf-9067.herokuapp.com',
                       session: val.split('?')[1],
                       connect: true});
    });
};

AddDocument.prototype.justDoIt = function(signalingOptions,
                                          name,
                                          importFromJSON){
    // #0 analyse the arguments
    // (TODO) fix the uglyness of this code
    var options = { webRTCOptions: this.connectionOptions };
    if (signalingOptions) { options.signalingOptions = signalingOptions; };
    if (name) { options.name = name; };
    if (importFromJSON) {
        options.importFromJSON = importFromJSON;
        if (!options.signalingOptions){ options.signalingOptions = {}; };
        options.signalingOptions.connect = true; // (TODO) may change this val
    };

    // #1 add a cell into the list of editors
    var cellAndContainer = this.viewDocuments.addDocumentContainer();
    var editorContainer = cellAndContainer.container;
    var cell = cellAndContainer.cell;

    // #2 cratify the cell
    var editor = editorContainer.cratify(options)[0];
    var button = this.viewDocuments.addQuickAccessButton(
        editor.model.name);

    var self = this;
    // #3A quick access button
    button.click(function(){
        $('body').animate({scrollTop:0});
        self.viewDocuments.container.animate({
            scrollLeft: editorContainer.offset().left +
                self.viewDocuments.container.scrollLeft() +
                editorContainer.width()/2 - $('body').width()/2
        }, 500);;
    });
    // #3B on removal of the editor, remove the according divisions
    editor.closeButton.click(function(){
        cell.remove();
        button.remove();
    });
    // #3C add save button
    var saveDiv = jQuery('<div>')
        .css('display', 'inline-block')
        .css('margin-right', '10px');
    editor.header.prepend(saveDiv);
    var vsb = new RoundButton(saveDiv, '<i class="fa fa-floppy-o"></i>', 'save')
    var csb = new CSaveButton(vsb.button, editor);    
};
