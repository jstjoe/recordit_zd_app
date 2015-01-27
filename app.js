(function() {

  return {
    defaultState: 'home',
    events: {
      // 'app.activated':'load',
      'click .generate_link':'load',
      'click .recordit_link':'launched',
      'notification.screencastDone':'showRecording',
      'notification.loginDone':'loginDone',
      'click .copy_link':'copyLink',
      'click .copy_embed':'copyEmbed',
      'click .copy_linked_embed':'copyLinkedEmbed'
    },

    requests: {
      getLink: function(user_email, user_id, subdomain, ticket_id, token, role) {
        return {
          url: helpers.fmt('http://zen-recordit.herokuapp.com/recordituri?user_email=%@&user_id=%@&role=%@&subdomain=%@&ticket_id=%@&token=%@', user_email, user_id, role, subdomain, ticket_id, token),
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      }
    },
    loginDone: function(data) {
      console.log("Token updated");
      this.store('recordit', data.token);
    },

    load: function(e) {
      if(e) {e.preventDefault();}
      var user_email = encodeURIComponent(this.currentUser().email()),
        user_id = this.currentUser().id(),
        ticket_id = this.ticket().id(),
        subdomain = this.currentAccount().subdomain(),
        role = 'agent', // TODO set this based on a Select
        token = this.store('recordit');
      this.ajax('getLink', user_email, user_id, subdomain, ticket_id, token, role)
      .done(function(response) {
        this.launchURI = response.uri;
        this.switchTo('link', { uri: this.launchURI });
      });
    },
    launched: function() {
      // TODO: IF hide on launch setting true
      services.appsTray().hide();
    },
    showRecording: function(data) {
      if(data.ticketID == this.ticket().id() ) {
        services.appsTray().show();
        this.recorditURL = data.recorditURL;
        this.gifURL = data.gifURL;

        var growl = helpers.fmt('Received <a href="%@" target="blank">recording</a> on ticket #%@.', this.recorditURL, data.ticketID);  //<a href="#/tickets/%@">ticket #%@</a>
        services.notify(growl);
        console.log(data);
        this.switchTo('show', {
          data: data
        });
      } else {
        console.log(data);
      }
    },
    copyLink: function() {
      var markdown = helpers.fmt('[Recordit Screencast](%@)', this.recorditURL);
      this.pasteComment(markdown);
    },
    copyEmbed: function() {
      var markdown = helpers.fmt('![](%@)', this.gifURL);
      this.pasteComment(markdown);
    },
    copyLinkedEmbed: function() {
      var markdown = helpers.fmt('[![](%@)](%@)', this.gifURL, this.recorditURL);
      this.pasteComment(markdown);
    },
    pasteComment: function(markdown) {
      var existingComment = this.comment().text();
      if (!existingComment) {
        this.comment().text(markdown);
      } else {
        this.comment().text(existingComment + '\n\n' + markdown);
      }
    }

  };

}());
