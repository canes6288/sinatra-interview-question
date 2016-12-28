document.addEventListener("DOMContentLoaded", function(event) {

  document.getElementById("submit").onclick = function() {

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

          if (posterUrl == 'N/A' || posterUrl === 'undefined') {
            posterImage = ""
          } else {
            posterImage = "<img class='poster' src='" + posterUrl + "'>"
          }

          searchResultsDiv = document.getElementById("search-results");
          resultDiv = "<div id='search-result["+ i +"]' class='row' style='padding:30px'><div class='col-md-4 col-sm-6'>" + posterImage + "</div><div class='col-md-8 col-sm-6 col-xs-12'><div class='jumbotron'><h4 id='title'>" + title + "</h4><h4>(" + year + ")</h4><hr/><p class='lead'><button id='" + imdbId +  "'class='details-btn btn btn-primary btn-lg' role='button'>Details</button><br/><br/><button id='" + imdbId +  "' value='" + title + "' class='favorite-btn btn btn-danger btn-lg' role='button'>Favorite</button></p></div></div></div>"


          searchResultsDiv.innerHTML += resultDiv;
        };

        // Need to add an event listener to each button.  Unable to do it in the loop above because it rebuilds the DOM, removing the event listeners except for the last one.

        var detailButtons = document.getElementsByClassName("details-btn")

        for (var i = 0; i < detailButtons.length; i++) {
          detailButtons[i].addEventListener('click', function() {
            // Find the search result div based after the Details button is clicked.  If the first Details button is clicked, then this code will climb up the DOM and find the search result div.  We'll then replace the InnerHTML with details after the Details button is clicked.
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
                  posterImage = ""
                } else {
                  posterImage = "<img class='poster' src='" + posterUrl + "'>"
                }

                searchResultDiv.innerHTML = ("<div id='search-result["+ i +"]' class='row' style='padding:30px'><div class='col-md-4 col-sm-6'>" + posterImage + "</div><div class='col-md-8 col-sm-6 col-xs-12'><div class='jumbotron'><h4 id='title'>" + title + "</h4><h4>(" + year + ")</h4><hr/><h4>Rating</h4><p class='lead'>"+ rating +"</p><hr/><h4>Plot</h4><p class='lead'>"+ plot +"</p><hr/><h4>Awards</h4><p class='lead'>"+ awards +"</p><hr/><h4>Metascore Rating</h4><p class='lead'>"+ metascoreRating +"</p></div></div>")
              };
            };

            detailsRequest.send();
          });
        };

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

  // favorites list
  document.getElementById("favorite-list").onclick = function() {

    var favoriteListRequest = new XMLHttpRequest();
    favoriteListRequest.open('GET', '/favorites', true);

    favoriteListRequest.onload = function() {
      if (favoriteListRequest.status >= 200 && favoriteListRequest.status < 400) {
        searchResultsDiv = document.getElementById("search-results")

        // erase search results, and add 'Favorites' header to top of favorites list
        searchResultsDiv.innerHTML = ("<h3 style='padding:40px;'>Favorites</h3>")

        var favoriteList = JSON.parse(favoriteListRequest.responseText);

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
                posterImage = ""
              } else {
                posterImage = "<img class='poster' src='" + posterUrl + "'>"
              }

              searchResultsDiv.innerHTML += ("<div id='search-result["+ i +"]' class='row' style='padding:30px'><div class='col-md-4 col-sm-6'>" + posterImage + "</div><div class='col-md-8 col-sm-6 col-xs-12'><div class='jumbotron'><h4 id='title'>" + title + "</h4><h4>(" + year + ")</h4><hr/><h4>Rating</h4><p class='lead'>"+ rating +"</p><hr/><h4>Plot</h4><p class='lead'>"+ plot +"</p><hr/><h4>Awards</h4><p class='lead'>"+ awards +"</p><hr/><h4>Metascore Rating</h4><p class='lead'>"+ metascoreRating +"</p></div></div>")
            };
          };
          detailsRequest.send();
        };
      };
    };

    favoriteListRequest.send();
  };
});
