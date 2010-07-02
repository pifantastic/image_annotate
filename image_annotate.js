(function($, Drupal) {

/**
 * Object.create ala Douglas Crockford
 */
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}

/**
 * jQuery Plugin image_annotate
 */
$.fn.image_annotate = function(options) {
  if (this.length) {
    return this.each(function() {
      var image = Object.create(ImageAnnotate);
      image.init(options, this);
    });
  }
};

/**
 * Setup Drupal behavior to find annotatable images and 
 * apply plugin
 */
Drupal.behaviors.image_annotate = function() {
  for (var i = 0; i < Drupal.settings.image_annotate.length; i++) {
    var settings = Drupal.settings.image_annotate[i];
    $('#' + settings.id).image_annotate(settings);
  }
};

var ImageAnnotate = {
  /**
   * Constructor
   */
  init: function(options, elem) {
    this.options = options;
    this.elem = elem;
    this.$elem = $(elem);
    
    if (!this.$elem.hasClass('image-annotate-processed')) {
      this._build();
    }
  },
  
  /**
   * Build necessary DOM elements
   */
  _build: function() {
    // Alias this so we can reference in callbacks
    var self = this;
    
    // Create the canvas and hide the original image
    self.$canvas = $('<div class="image-annotate-canvas"><div class="image-annotate-annotater"></div><div class="image-annotate-form"><textarea></textarea><input type="button" class="image-annotate-save" value="Save" /><input type="button" class="image-annotate-cancel" value="Cancel" /></div></div>');
    self.$elem.before(self.$canvas);
    self.$canvas
      .width(self.$elem.width())
      .height(self.$elem.height())
      .css('background-image', 'url("'+ self.$elem.attr('src') +'")')
      .addClass(self.options.style);
    self.$elem.hide();
    
    // Show/hide annotations on hover
    self.$canvas.hover(function() {
      // Only show notes if we aren't editing
      if (self.$canvas.find('.image-annotate-form').is(":hidden")) {
        self.showNotes();
      }
    },function() {
      self.hideNotes();
    });
    
    self.$form = self.$canvas.find('.image-annotate-form').hide();
    self.$annotater = self.$canvas.find('.image-annotate-annotater').hide();
    
    // Callback to attach the form to the annotater
    var attachFormToAnnotater = function() {
      self.$form.css({
        left: self.$annotater.position().left +'px',
        top: (parseInt(self.$annotater.position().top) + parseInt(self.$annotater.height()) + 2) +'px'
      });
    };
    
    // Make the annotater draggable/resizable
    self.$annotater
      .draggable({
        containment: 'parent',
        drag: attachFormToAnnotater,
        stop: attachFormToAnnotater
      });
    
    if (self.options.resizable) {
      self.$annotater.resizable({
        handles: 'all',
        resize: attachFormToAnnotater
      });
    }
    
    // Add 'Add a note' link
    if (self.options.editable) {
      self.$add = $(self.options.add).attr("id", "image-annotate-add");
      self.$canvas.before(self.$add);
      self.$add.click(function() {
        self.showForm();
        self.hideNotes();
        attachFormToAnnotater();
        return false;
      });
    }
        
    // Add submit handler to form
    self.$form.find(".image-annotate-save").click(function() {
      self.saveNote();
    });
    
    // Set cancel handler
    self.$form.find('.image-annotate-cancel').click(function() {
      self.hideForm();
      self.showNotes();
    });
    
    // Add notes
    for (var x = 0; x < self.options.notes.length; x++) {
      self.addNote(self.options.notes[x]);
    }
    
    self.hideNotes();
    
    self.$elem.addClass('image-annotate-processed');
  },
  
  /**
   * Save an annotation
   */
  saveNote: function(aid) {
    var self = this;
    var url = Drupal.settings.basePath + 'image-annotate/create/' + self.options.nid;
    
    var data = {
      field_name: self.options.field,
      delta: self.options.delta,
      note: self.$form.find("textarea").val(),
      position_left: self.$annotater.position().left,
      position_top: self.$annotater.position().top,
      size_width: self.$annotater.width(),
      size_height: self.$annotater.height(),
    };
    
    if (aid) {
      data.aid = aid;
      url = Drupal.settings.basePath + 'image-annotate/edit/' + self.options.nid;
    }
    
    $.post(url, data, function(response) {
      data.note = response.note;
      data.editable = true;
      self.addNote(data);
      self.hideForm();
      self.showNotes();
    }, "json");
    
    return false;
  },
  
  /**
   * Add a tag to this image
   */
  addNote: function(opts) {
    var self = this;
    
    // Create note
    var $note = $('<div class="image-annotate-note"><div class="image-annotate-marker"></div><div class="image-annotate-text"></div></div>')
      .css({
        top: opts.position_top + 'px',
        left: opts.position_left + 'px'
      })
      .appendTo(this.$canvas);
    
    // Set the marker size
    if (self.options.resizable) {
      var $marker = $note.find('.image-annotate-marker').css({
        height: opts.size_height + 'px',
        width: opts.size_width + 'px'
      });
    }
    
    // Set the note text
    var $text = $note.find('.image-annotate-text').html(opts.note || "").hide();
    
    // Add the edit options if the user can edit this note
    if (opts.editable) {
      var $actions = $('<div><a href="#" class="image-annotate-delete-note">delete</a></div>');
      $text.append($actions);
      $actions.find('.image-annotate-delete-note').click(function() {
        self.deleteNote(opts.aid, $note);
        return false;
      });
    }
    
    // Set the note hover states
    $note.hover(function() {
      $note.addClass('active').siblings('.image-annotate-note').addClass('dim');
    }, function() {
      $note.removeClass('active').siblings('.image-annotate-note').removeClass('dim');
    });
  },
  
  /**
   * Delete an annotation
   */
  deleteNote: function(aid, $note) {
    var url = Drupal.settings.basePath + 'image-annotate/delete/' + aid;
    
    $.post(url, { aid: aid }, function(response) {
      $note.remove();
    });
    
    return false;
  },
  
  // Show all annotations for this image
  showNotes: function() {
    this.$canvas.find('.image-annotate-note').removeClass('image-annotate-note-hide');
  },
  
  // Hide all annotations for this image
  hideNotes: function() {
    this.$canvas.find('.image-annotate-note').addClass('image-annotate-note-hide');
  },
  
  // Show the annotation form
  showForm: function() {
    this.$canvas.find('.image-annotate-annotater').removeClass('image-annotate-annotater-hide');
    this.$canvas.find('.image-annotate-form').removeClass('image-annotate-form-hide');
  },
  
  // Hide the annotation form
  hideForm: function() {
    this.$canvas.find('.image-annotate-annotater').addClass('image-annotate-annotater-hide');
    this.$canvas.find('.image-annotate-form').addClass('image-annotate-form-hide');
  }
};

})(jQuery, Drupal);
