document.addEventListener("DOMContentLoaded", function(event) {

  document.getElementById("search-btn").onclick = function() {

    searchResultsDiv = document.getElementById("search-results").innerHTML = "<div id='search-results'></div>";

    var searchText = document.getElementById("search-field").value
    var searchQuery = searchText.split(' ').join('+')
    var searchUrl = 'http://www.omdbapi.com/?s=' + searchQuery + '&y=&plot=short&r=json'

    var searchRequest = new XMLHttpRequest();
    searchRequest.open('GET', searchUrl, true);

    searchRequest.onload = function() {
      if (searchRequest.status >= 200 && searchRequest.status < 400) {
        var data = JSON.parse(searchRequest.responseText);
        var searchResults = data["Search"]

        for (var i = 0; i < searchResults.length; i++) {
          var imdbId = searchResults[i]["imdbID"]
          var title = searchResults[i]["Title"]
          var year = searchResults[i]["Year"]
          var posterUrl = searchResults[i]["Poster"]
          var posterImage

          // if the image doesn't exist on OMDB, then replace it with a 'Sorry, image doesn't exist' image.
          if (posterUrl == 'N/A' || posterUrl === 'undefined') {
            posterImage = "<img class='poster' src='http://www.kalahandi.info/wp-content/uploads/2016/05/sorry-image-not-available.png'>"
          } else {
            posterImage = "<img class='poster' src='" + posterUrl + "'>"
          }

          searchResultsDiv = document.getElementById("search-results");
          resultDiv = "<div id='search-result["+ i +"]' class='row' style='padding:30px'><div class='col-md-4 col-sm-6'>" + posterImage + "</div><div class='col-md-8 col-sm-6 col-xs-12'><div class='jumbotron'><h4 id='title'>" + title + "</h4><h4>(" + year + ")</h4><hr/><p class='lead'><button id='" + imdbId +  "'class='details-btn btn btn-primary btn-lg' role='button'>Details</button><br/><br/><button id='" + imdbId +  "' value='" + title + "' class='favorite-btn btn btn-danger btn-lg' role='button'>Favorite</button></p></div></div></div>"


          searchResultsDiv.innerHTML += resultDiv;
        };

        // Need to add an event listener to each button.  Unable to do it in the loop above because every time
        // this line runs 'searchResultsDiv.innerHTML += resultDiv;' it rebuilds the HTML in the div, removing the event listeners except for the last one.
        var detailButtons = document.getElementsByClassName("details-btn")

        for (var i = 0; i < detailButtons.length; i++) {
          detailButtons[i].addEventListener('click', function() {
            // If the first Details button is clicked, then this code will climb up the DOM and find the search result div for that specific search result.
            // We'll then replace the InnerHTML with details after the Details button is clicked.
            var searchResultDiv = this.parentElement.parentElement.parentElement.parentElement

            var imdbId = this.id
            var detailsURL = 'http://www.omdbapi.com/?i=' + imdbId + '&y=&plot=short&r=json'

            var detailsRequest = new XMLHttpRequest();
            detailsRequest.open('GET', detailsURL, true);

            detailsRequest.onload = function() {
              if (detailsRequest.status >= 200 && detailsRequest.status < 400) {
                var searchResult = JSON.parse(detailsRequest.responseText);
                var title = searchResult["Title"]
                var year = searchResult["Year"]
                var rating = searchResult["Rated"]
                var plot = searchResult["Plot"]
                var awards = searchResult["Awards"]
                var metascoreRating = searchResult["Metascore"]
                var posterUrl = searchResult["Poster"]
                var posterImage;

                if (posterUrl == 'N/A' || posterUrl === 'undefined') {
                  posterImage = "<img class='poster' src='http://www.kalahandi.info/wp-content/uploads/2016/05/sorry-image-not-available.png'>"
                } else {
                  posterImage = "<img class='poster' src='" + posterUrl + "'>"
                }

                searchResultDiv.innerHTML = ("<div id='search-result["+ i +"]' class='row' style='padding:30px'><div class='col-md-4 col-sm-6'>" + posterImage + "</div><div class='col-md-8 col-sm-6 col-xs-12'><div class='jumbotron'><h4 id='title'>" + title + "</h4><h4>(" + year + ")</h4><hr/><h4>Rating</h4><p class='lead'>"+ rating +"</p><hr/><h4>Plot</h4><p class='lead'>"+ plot +"</p><hr/><h4>Awards</h4><p class='lead'>"+ awards +"</p><hr/><h4>Metascore Rating</h4><p class='lead'>"+ metascoreRating +"</p></div></div>")
              };
            };

            detailsRequest.send();
          });
        };

        // Find all the favorite buttons and empower them with javascript.
        // A button will change colors, text, and request information after being clicked.
        var favoriteButtons = document.getElementsByClassName("favorite-btn")

        for (var i = 0; i < favoriteButtons.length; i++) {
          favoriteButtons[i].addEventListener('click', function() {
            this.style.backgroundColor = 'green'
            this.style.borderColor = 'green'
            this.innerHTML = 'Added to Favorites'
            this.disabled = 'true'

            var imdbId = this.id
            var title = this.value

            var data ='imdb_id='+ encodeURIComponent(imdbId) + '&name=' + encodeURIComponent(title)

            var favoriteRequest = new XMLHttpRequest();
            favoriteRequest.open('POST', '/favorites', true);
            favoriteRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            favoriteRequest.send(data);

          });
        };

      } else {
        alert('An Error occurred after reaching the server')
      }
    };

    searchRequest.onerror = function() {
      alert('An Error occurred trying to connect to the server')
    };

    searchRequest.send();
  };

  // clear favorites list
  document.getElementById("clear-favorites").onclick = function() {
    var clearFavoriteRequest = new XMLHttpRequest();
    clearFavoriteRequest.open('POST', '/clear-favorites', true);

    clearFavoriteRequest.send();

    document.getElementById("favorite-list").click()
  }

  // show favorites list
  document.getElementById("favorite-list").onclick = function() {

    var favoriteListRequest = new XMLHttpRequest();
    favoriteListRequest.open('GET', '/favorites', true);

    favoriteListRequest.onload = function() {
      if (favoriteListRequest.status >= 200 && favoriteListRequest.status < 400) {
        favoriteDiv = document.getElementById("search-results")

        // erase search results, and add 'Favorites' header to top of favorites list
        favoriteDiv.innerHTML = ("<h3 style='padding:40px;'>Favorites</h3>")

        var favoriteList = JSON.parse(favoriteListRequest.responseText);

        // If no favorites have been selected, then it will show you text telling you so.
        if (favoriteList.length == 0) {
          favoriteDiv.innerHTML += ("<h4 style='padding:40px;'>You currently have no favorite movies!  Go search for your favorite movies and add them!</h4>")
        };

        for (var i = 0; i < favoriteList.length; i++) {
          var title = favoriteList[i]["name"]
          var imdbId = favoriteList[i]["imdb_id"]

          var detailsURL = 'http://www.omdbapi.com/?i=' + imdbId + '&y=&plot=short&r=json'

          var detailsRequest = new XMLHttpRequest();
          detailsRequest.open('GET', detailsURL, false);

          detailsRequest.onload = function() {
            if (detailsRequest.status >= 200 && detailsRequest.status < 400) {
              var searchResult = JSON.parse(detailsRequest.responseText);
              var title = searchResult["Title"]
              var year = searchResult["Year"]
              var rating = searchResult["Rated"]
              var plot = searchResult["Plot"]
              var awards = searchResult["Awards"]
              var metascoreRating = searchResult["Metascore"]
              var posterUrl = searchResult["Poster"]
              var posterImage;

              if (posterUrl == 'N/A' || posterUrl === 'undefined') {
                posterImage = "<img class='poster' src='http://www.kalahandi.info/wp-content/uploads/2016/05/sorry-image-not-available.png'>"
              } else {
                posterImage = "<img class='poster' src='" + posterUrl + "'>"
              }

              favoriteDiv.innerHTML += ("<div id='search-result["+ i +"]' class='row' style='padding:30px'><div class='col-md-4 col-sm-6'>" + posterImage + "</div><div class='col-md-8 col-sm-6 col-xs-12'><div class='jumbotron'><h4 id='title'>" + title + "</h4><h4>(" + year + ")</h4><hr/><h4>Rating</h4><p class='lead'>"+ rating +"</p><hr/><h4>Plot</h4><p class='lead'>"+ plot +"</p><hr/><h4>Awards</h4><p class='lead'>"+ awards +"</p><hr/><h4>Metascore Rating</h4><p class='lead'>"+ metascoreRating +"</p></div></div>")
            };
          };
          detailsRequest.send();
        };
      };
    };

    favoriteListRequest.send();
  };
});

