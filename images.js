// You have to generate your own token, unfortunately 
var token = "";
var IGRequestURL = "https://api.instagram.com/v1/users/self/media/recent/";
var flickrRequestURL = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
var instagramData;
var postsDisplayed = false;


function getImagesIG() {
   $.ajax({
      url: IGRequestURL,
      dataType: 'jsonp',
      type: 'GET',
      data: {access_token: token, count: 9},
      success: function(data){
         instagramData = data;

         // Change the behavior of the load images button so that it
         // displays images without performing an ajax request from here on out
         $("#loadImgsBtn").attr("onClick", "displayImagesIG()");

         displayImagesIG();
      },
      error: function(data) {
         console.log(data);
      }
   });
}


function displayImagesIG() {
   // Start by hiding the button, so no more requests to Instagram can be
   // made
  $("#loadImgsBtn").attr("style", "display: none");

   // Now unhide all the posts
   $("#IGPosts").attr("style", "display:");

   // Hide the selected image and hashtags section
   $("#imageAndTags").attr("style", "display: none");

   // Remove the all the flickr posts
   $('#flickrPosts').html("");

   // If the posts haven't been displayed yet, then display them
   if (!postsDisplayed) {

      // Iterate through all the posts returned by AJAX
      // We'll be arranging the images in a 3x3 grid
      for (i in instagramData.data) {
         // If this is the first post in a row (1st, 4th, & 7th post), then
         // create a new row
         if ((i % 3) == 0) {
            $("#IGPosts").append(
               $("<div>").attr("class", "row").attr("id", "IG" + i/3)
            );

            // Add a line break after the row
            $("#IGPosts").append($("<br />"));
         }

         $('#IG' + Math.floor(i/3)).append(
            $('<div>').attr("class", "col").html(
               $('<img>')
                  .attr("src", instagramData.data[i].images.low_resolution.url)
                  .attr("onClick", "displayTags(" + i +")")
            )
         );
      }

      // Indicate that we've put the images on the page
      postsDisplayed = true;
   }

   // Finally, update the instructions so the user knows what to do next
   $("#instructions")
   .html("Select an image to see all the hashtags associated with that image");
}


function displayTags(imgNum) {
   // Update the instructions to tell the user what to do next
   $("#instructions").html(
      "Select a hashtag to search Flickr for images assoicated with that tag."
   + "<br/> Or click the back button to view all images again"
   + "<br/> Or click on the image itself to open the post on Instagram");
   $("#loadImgsBtn").html("Back").attr("style", "");

   // Firstly, hide all the other posts
   $("#IGPosts").attr("style", "display: none");

   // Next unhide the post and hashtags area
   $("#imageAndTags").attr("style", "display: ");

   // Now display the image that was selected
   $('#image')
      .attr("src", instagramData.data[imgNum].images.standard_resolution.url);

   // Set the image link to link to the post on Instagram
   $('#imageLink').attr("href", instagramData.data[imgNum].link);

   // If this post as hashtags, then display them.
   if (instagramData.data[imgNum].tags.length > 0) {
      // Clear out any hashtags that may have been displayed by a different post
      $("#tags").html("");

      // Iterate over all the hashtags and create a button for each
      instagramData.data[imgNum].tags.forEach(function(tag) {
         $("#tags").append(
            $("<button>")
            .attr("onClick", "getImagesFlickr('" + tag + "')")
            .attr("class", "btn col-2 btn-outline-dark")
            .html(tag)
         );
      });
   }

   // Otherwise, tell the user to select a different image
   else {
      $("#tags").html("There are no hashtags associated with this post."
      + " Please go back and choose another");
   }
}


function getImagesFlickr(tag) {
   // Update the instructions to inform the user that they're seeing all the
   // posts assoicated with the given tag
   $('#instructions').html(
      "Now displaying posts from Flickr that are tagged with \"" + tag +"\"." +
      "<br/>Click the back button to return to all the Instagram posts"
   );

   // Hide the selected instagram post, along with all of its tags.
   $("#imageAndTags").attr("style", "display: none");

   // Send a request to Flickr and get all the posts assoicated with the given
   // tag
   $.ajax({
      url: flickrRequestURL,
      dataType: 'jsonp',
      type: 'GET',
      data: {
         tags: tag,
         tagmode: "any",
         format: "json"
      },
      success: function(data) {
         displayImagesFlickr(data);
      },
      error: function(data) {
         console.log(data);
      }
   });
}


function displayImagesFlickr(data) {

   // Iterate through all of the posts and display them
   $.each(data.items, function(i, item) {
      // We want 4 posts per row, so for every fourth post (starting with the
      // first) create a new row
      if ((i % 4) == 0) {
         $('#flickrPosts').append(
            $('<div>').attr("class", "row").attr("id", "flickr" + i/4)
         );

         // Add a line break after the row
         $('#flickrPosts').append($("<br />"));
      }

      // Now add the flickr post, along with a link to the actual post on Flickr
      $('#flickr' + Math.floor(i/4)).append(
         $('<div>').attr("class", "col").html(

            // The image itself will be a link to the post on Flickr
            $('<a>')
               .attr("href", item.link)
               // This will open the flickr link in a new tab
               .attr("target", "_blank")
               .html(
                  $('<img>')
                     .attr("src", item.media.m)

                     // Hovering the mouse over the image will display the post's
                     // name, as well as its authro
                     .attr("title", item.title + " by "
                        + item.author)
               )
         )
      );
   });
}
