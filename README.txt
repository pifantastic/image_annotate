Image Annotate allows users to attach notes or user references to areas of a picture. This is
what Flickr and Facebook already do.

This module is based on jQuery UI and only work with the Image and ImageField modules: please
feedback, issues and remarks on the project page (http://drupal.org/project/image_annotate).

Install
-------

1. Copy the image_annotate folder into your module folder.

2. Go to the modules page (admin/build/modules) and enable the Image Annotate module
   (dependency on jquery_ui and imagefield modules, tested with the jQuery UI 1.6 library)

3. Go to the permissions page (admin/user/permissions) and activate the appropriate
   permissions: users need both permissions for comments AND image annotations.

4. Navigate to the admin page of the content type for which you want to have an
   annotative image (admin/content/node-type/YOUR_CONTENT_TYPE):

   a. Activate comments for that content type ("Comment settings")

   b. Go to the "Display fields" sub section (admin/content/node-type/picture/display) and
      select the widget for handling display of the body: select the "Image with annotations" one.

4. Next time you create a node of that type, when viewing the node you will see
   an "Add a note" link that lets you add comments on the picture (given that you have
   the permission to do so).

Style
-----

Here is an example of the markup that is generated when annotations are enabled for an image.

<div class="field-item odd">
  <a href="#" id="image-annotate-add">Add note</a>
  <div class="image-annotate-canvas pushpin">
    <div class="image-annotate-annotater ui-draggable"></div>
    <div class="image-annotate-form">
      <textarea></textarea>
      <input type="button" class="image-annotate-save" value="Save">
      <input type="button" class="image-annotate-cancel" value="Cancel">
    </div>
    <div class="image-annotate-note image-annotate-note-hide">
      <div class="image-annotate-marker"></div>
      <div class="text">
        "This is an annotation"
        <span class="author"> by <a href="/user/1" title="View user profile.">admin</a></span>
        <div><a href="#" class="image-annotate-delete-note">delete</a></div>
      </div>
    </div>
    <div class="image-annotate-note image-annotate-note-hide">
      <div class="image-annotate-marker"></div>
      <div class="text">
        "This is a second annotation."
        <span class="author"> by <a href="/user/1" title="View user profile.">admin</a></span>
        <div><a href="#" class="image-annotate-delete-note">delete</a></div>
      </div>
    </div>
  </div>
  <img class="imagefield imagefield-field_image image-annotate image-annotate-field_image image-annotate-processed" id="image-annotate-12-field_image-0" width="981" height="354" src="/sites/default/files/image.png">
</div>

Todo:
-----

This module is still being actively develop, here are a few things that are still to be done:

* Clean and optimize jQuery

* Add a hook to enable other types of annotations: user reference, taxonomy...

Author:
-------
Ronan Berder <hunvreus@gmail.com>
http://drupal.org/user/49057
http://teddy.fr