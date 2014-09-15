(function() {

  return {
    defaultState: 'home',
    events: {
      // 'app.activated':'load',
      'click .generate_link':'load',
      'click .recordit_link':'launched',
      'notification.screencastDone':'showRecording',
      'click .copy_link':'copyLink',
      'click .copy_embed':'copyEmbed',
      'click .copy_linked_embed':'copyLinkedEmbed'
    },

    requests: {
      getLink: function(user, account, ticketID) {
        return {
          url: helpers.fmt('http://zen-recordit.herokuapp.com/recordituri?user=%@&account=%@&ticket_id=%@&role=agent', user, account, ticketID),
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      }
    },

    load: function() {
      var user = encodeURIComponent(this.currentUser().email()),
        ticketID = this.ticket().id(),
        account = this.currentAccount().subdomain();
      this.ajax('getLink', user, account, ticketID).done(function(response) {
        console.log(response);
        this.switchTo('link', { uri: response.uri });
      });
    },
    launched: function() {
      services.appsTray().hide();
    },
    showRecording: function(data) {
      if(data.ticketID == this.ticket().id()) {
        services.appsTray().show();
        this.recorditURL = data.recorditURL;
        this.gifURL = data.gifURL;

        var growl = helpers.fmt('Received Recording! <a href="%@">GIF</a>', this.gifURL);
        services.notify(growl);
        console.log(data);
        this.switchTo('show', {
          data: data
        });
      } else {
        console.log('Notification not for this ticket.');
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
