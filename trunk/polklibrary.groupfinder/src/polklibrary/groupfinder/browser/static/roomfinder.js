

var UTILITY = {
    
    date : function(date, h, m, s){
        var d = date.split('-');
        return new Date(parseInt(d[0]),parseInt(d[1])-1,parseInt(d[2]),h,m,s,0);
        
    },     
    
    // date : function(date, hour, minutes, seconds){
    
        // if (hour < 10)
            // hour = '0' + hour;
        // if (minutes < 10)
            // minutes = '0' + minutes;
        // if (seconds < 10)
            // seconds = '0' + seconds;
            
        // return new Date(date + 'T' + hour + ':' + minutes + ':' + seconds);
    // }, 
    
    text_shorty : function(e) {      
        var w = $(e).width();
        $(e).find('.pat-text-shorty').css('width', (w/2)+'px');
    }, 
    

}


var GroupFinder = {

    MINUTE_INTERVALS : 15,
    row_height : 0,
    timeline_top_space : 250,
    
    active_column : null,
    active_start_row : null,
    active_end_row : null,
    active_room_title : '',
    
    submission_lock : false,

    init : function() {
        var self = this;
        self.setup_addevent_handlers();
        self.validate_emails();
        self.validate_titles();
        $(document).on('input propertychange change', '#gf-pickadate' , function(){
                self.clear();
                self.build();
        });
        
        setTimeout(function(){
            self.build(); // initial go
        },1000);
        
        
        // Register to location based system
        if (typeof window.CampusLocation !== 'undefined'){
            window.CampusLocation.OnChange(function(){
                self.fix_mobile_columns();
            });           
        }
    },
    
    build : function(){
        var v = parseInt($('#gf-pickadate').val().replace(/-/g, ''));
        //if (v < 20190608){ //20190608
            this.build_loader();
            this.build_location_columns();
            this.build_event_list();
            this.live_timeline();
        //}
        //else 
        //    alert('Room reservation system is upgrading June 8th and no reservations can be made after this date until upgrade is complete.');
    },
    
    clear : function(){
        $('#gf-events').empty();
    },
    
    build_loader : function() {
        var loader = $('<div>').addClass('gf-backdrop').attr('id','gf-loaddrop');
        $('#gf-events').append(loader);
    },
    
    build_location_columns : function() {
        // SETUP ROOM COLUMN
        for (var i in GFLocations) {
            var div_events = $('<div>').addClass('gf-time-column ' + GFLocations[i].extraCSS).attr({
                'data-pos': i,
            });
            
            var a = $('<a>').attr('href',GFLocations[i].getURL).html(GFLocations[i].Title);
            var info = $('<div>').addClass('b').addClass('show-1024').addClass('gf-mobile-header').html(a);
            $(div_events).append(info);
            
            this.build_timeslots(div_events);
            $('#gf-events').append(div_events);
        }
        
        this.fix_mobile_columns();
    },
    
    
    build_timeslots : function(column) {  
        var self = this;
        for (var h = 0; h < 24; h++) {
            for (var m = 0; m < 60; m+=this.MINUTE_INTERVALS) {
                var label = $('<label>').html( this.format_time(h, m));
                var div = $('<div>').addClass('gf-timeslot').attr('data-hour', h).attr('data-minute', m).html(label)
                .mousedown(function(e){
                    self.active_column = column;
                    self.active_start_row = this;
                })
                .mouseup(function(e){
                    self.active_column = column;
                    self.active_end_row = this;
                    $(self.active_column).find('*').removeClass('highlighted');
                    self.show_addevent_overlay(); // Do main stuff, then nullify
                    self.active_column = null;
                    self.active_start_row = null;
                    self.active_end_row = null;
                }).hover(
                    function(e){
                        $(self.active_column).find(self.active_start_row).nextUntil(e.target).andSelf().addClass('highlighted');
                    },
                    function(){
                        $(self.active_column).find('*').removeClass('highlighted');
                    }
                );
                $(column).append(div);
            }
        }
        self.row_height = $('.gf-timeslot:visible').outerHeight();
    },    
    
    // build_timeslots : function(column) {  
        // var self = this;
        // for (var h = 0; h < 24; h++) {
            // for (var m = 0; m < 60; m+=this.MINUTE_INTERVALS) {
                // var label = $('<label>').html( this.format_time(h, m));
                // var div = $('<div>').addClass('gf-timeslot').attr('data-hour', h).attr('data-minute', m).html(label).click(function(){
                    // self.active_column = column;
                    // self.active_start_row = this;
                    // //self.show_addevent_overlay(column, this);
                // });
                // $(column).append(div);
            // }
        // }
        // self.row_height = $('.gf-timeslot').outerHeight();
    // },
    
    
    format_time : function(hour, minutes) {
        var pmam = ' am'
        if (minutes == 0) minutes = '00';
        if (hour >= 12) pmam = ' pm'
        if (hour > 12) hour-=12;
        if (hour == 0) hour=12;
        return hour + ':' + minutes + pmam;
    },
    
    get_gf_data : function(i) {
        return GFLocations[parseInt(i)];
    },
    
    
    build_event_list : function() {
        var self = this;
        var date = $('#gf-pickadate').val();
        var start = UTILITY.date(date,0,0,0);
        
        $('#gf-events > div.gf-time-column').each(function(i, element) {
            var id = self.get_gf_data($(this).attr('data-pos')).Id;
            var apiurl = $('body').attr('data-base-url') + '/room_api';
            var args = {
                'action': 'get',
                'id': id,
                'start': start.getTime(),
                'nocache': 'nc' + (new Date().getTime())
            };
            $.get(apiurl, args, function(response){
                for (var i in response.data) {
                    var ev = response.data[i];
                    self.taken_event(
                        element,
                        ev.title,
                        new Date(ev.start),
                        new Date(ev.end),
                        ev.f1,
                        ev.f2
                    )
                }   
                $('#gf-loaddrop').hide();
            });
            
        });
        
    },
    
    taken_event : function(element, label, start, end, field1, field2) {
        var self = this;
        var event = $(element).find('[data-hour='+ start.getHours() +'][data-minute='+ start.getMinutes() +']');
        $(event).attr({'data-field1':field1, 'data-field2':field2 });
        $(event).addClass('gf-event').addClass('gf-start').unbind('mousedown mouseup hover').append($('<span class="pat-text-shorty">').html(label));
        UTILITY.text_shorty($(event)); // shorten text
        var sweep = true;
        var tmp = 0;
        while(sweep && tmp < 24) {
            tmp++;
            event = $(event).next();
            if ($(event).is('[data-hour='+ end.getHours() +'][data-minute='+ end.getMinutes() +']')) 
                break;
            $(event).unbind('mousedown mouseup hover').addClass('gf-event');
        }
        
        $(element).find('[data-hour='+ start.getHours() +'][data-minute='+ start.getMinutes() +'].gf-start').on('click', function(){
            if ($('body').hasClass('userrole-authenticated') && GFCurrentUserRoles.Edit) {
                var f1 = atob($(this).attr('data-field1'));
                var f2 = atob($(this).attr('data-field2'));
                var confirmed = confirm("User: " + f2 + '\nIP:     ' + f1 + '\n\nRemove reservation?');
                if (confirmed){
                    self.delete_event_handler(this,start,end);
                }
            }
        });
    },
    
    delete_event_handler : function(element,start,end) {
        var self = this;
        var id = self.get_gf_data($(element).parents('div.gf-time-column').attr('data-pos')).Id;
        var apiurl = $('body').attr('data-base-url') + '/room_api';
        var args = {
            'action': 'remove',
            'id': id,
            'start': start.getTime(),
            'end': end.getTime(),
        };
        $.get(apiurl, args, function(response){
            if(response.code == 200) {
                self.clear();
                self.build();
            }
            else {
                alert('error');
            }
        });
    },    
    
    add_event_handler : function() {
        var self = this;
        var date = $('#gf-pickadate').val();
        var title = $('#gf-title').val();
        var email = $('#gf-email').val();
        var id = $('#gf-cal').val();
        
        var s_hour = parseInt($('#gf-start').find('option:selected').attr('data-hour'));
        var s_min = parseInt($('#gf-start').find('option:selected').val())
        var start = UTILITY.date(date,s_hour,s_min,0);

        var e_hour = parseInt($('#gf-end').find('option:selected').attr('data-hour'));
        var e_min = parseInt($('#gf-end').find('option:selected').val())
        var end = UTILITY.date(date,e_hour,e_min,59);
        
        // Prepare confirmation screen
        $('#gf-confirm-room').html(this.active_room_title);
        $('#gf-confirm-start').html($('#gf-start').find('option:selected').text());
        $('#gf-confirm-end').html($('#gf-end').find('option:selected').text());
        $('#gf-confirm-date').html(date);
        
        
        // Add event
        if (start < end) {
            try {
                useragent = navigator.userAgent;
            }catch(e) {
                useragent = 'Could not determine';
            }
            var now = new Date();
            var apiurl = $('body').attr('data-base-url') + '/room_api';
            var args = {
                'action': 'add',
                'id': id,
                'email': email,
                'title': title,
                'start': start.getTime(),
                'end': end.getTime(),
            };
            $.get(apiurl, args, function(response){
                if(response.code == 200) {
                    self.clear();
                    self.build();
                }
                else {
                    alert('error');
                }
            });
            
        }
        else
            alert("Couldn't submit: End time is before start time.");
        
    },
    
    show_addevent_overlay : function() {
    
        // Move to top
        $('html,body').animate({'scrollTop': 0}, 300);
            
        var title = $('#gf-title').val(''); // reset
        var room = this.get_gf_data($(this.active_column).attr('data-pos'));
        $('#gf-add-overlay #gf-cal').val(room.Id);
        $('#gf-add-overlay #gf-location > h2').html(room.Title);
        this.active_room_title = room.Title;
        $('#gf-add-overlay #gf-location > div').html($('<div>').html(room.body).text());
        $('#gf-add-overlay #gf-location > img').attr('src', room.image);
        
        // Show times based off of selected
        var hour = parseInt($(this.active_start_row).attr('data-hour'));        
        var minute = parseInt($(this.active_start_row).attr('data-minute'));
        var ehour = parseInt($(this.active_end_row).attr('data-hour'));        
        var eminute = parseInt($(this.active_end_row).attr('data-minute'));
        var end = new Date();
        end.setHours(ehour);
        end.setMinutes(eminute);
        end.setSeconds(0);
        end.setMilliseconds(0);
        end = new Date(end.getTime() + 15*60000); // add 15 minutes
        
        $('#gf-add-overlay #gf-start, #gf-add-overlay #gf-end').find('option:selected').prop('selected',false);
        $('#gf-add-overlay #gf-start').find('option[data-hour='+ hour +'][value='+ minute +']').prop('selected',true);
        $('#gf-add-overlay #gf-end').find('option[data-hour='+ end.getHours() +'][value='+ end.getMinutes() +']').prop('selected',true);
        
        this.suppress_taken_timeslots(this.active_column);
        $('#gf-add-overlay #gf-start').change();
        $('#gf-add-overlay, #gf-backdrop').fadeIn(200);
        
    },
    
    hide_addevent_overlay : function() {
        this.unsuppress_taken_timeslots();
        $('#gf-add-overlay, #gf-backdrop').fadeOut(200);
    },
    
    show_confirm_overlay : function() {
        this.unsuppress_taken_timeslots();
        $('#gf-add-overlay').fadeOut(100, function(){
            $('#gf-confirmed-overlay').show(200);
        });
    },
    
    hide_confirm_overlay : function() {
        $('#gf-confirmed-overlay, #gf-backdrop').fadeOut(200);
    },
    
    suppress_taken_timeslots : function() {
        
        // Looks weird but
        $(this.active_column).find('div.gf-event').each(function(i,row){
            var hour = parseInt($(row).attr('data-hour'));        
            var minute = parseInt($(row).attr('data-minute'));
            var start = new Date();
            start.setHours(hour);
            start.setMinutes(minute);
            start.setSeconds(0);
            start.setMilliseconds(0);
            futureend = new Date(start.getTime() + 15*60000); // add 15 minutes
            $('#gf-add-overlay #gf-start').find('option[data-hour='+ start.getHours() +'][value='+ start.getMinutes() +']').prop('disabled', true);
            $('#gf-add-overlay #gf-end').find('option[data-hour='+ futureend.getHours() +'][value='+ futureend.getMinutes() +']').prop('disabled', true);
        });
        
    },
    
    unsuppress_taken_timeslots : function() {
        $('#gf-add-overlay #gf-start, #gf-add-overlay #gf-end').find('option').prop('disabled', false);
    },
    
    setup_addevent_handlers : function() {
        var self = this;
        
        // Logic to prevent end from being more than start time
        $(document).on('input propertychange change', '#gf-start, #gf-end' , function(){
        
            // GET ALL TIME DATA
            var start_hour = parseInt($('#gf-start').find('option:selected').attr('data-hour'));
            var start_min = parseInt($('#gf-start').find('option:selected').val());
            var start = new Date();
            start.setHours(start_hour);
            start.setMinutes(start_min);
            start.setSeconds(0);
            start.setMilliseconds(0);
            
            var end_hour = parseInt($('#gf-end').find('option:selected').attr('data-hour'));
            var end_min = parseInt($('#gf-end').find('option:selected').val());
            var end = new Date();
            end.setHours(end_hour);
            end.setMinutes(end_min);
            end.setSeconds(0);
            end.setMilliseconds(0);
            paddedstart = new Date(start.getTime() + 15*60000); // add 15 minutes
            unpaddedstart = new Date(end.getTime() - 15*60000); // minus 15 minutes
                
            // CHECK FOR NO DISABLED TIMES BETWEEN TWO POINTS
            var event = $('#gf-start').find('option:selected');
            var tmp = 0;
            var found_between_event = false;
            while(!found_between_event && tmp < 24) {
                tmp++;
                var event = $(event).next();
                if ($(event).is('[disabled]'))
                    found_between_event = true;
                
                if( parseInt($(event).val()) == unpaddedstart.getMinutes() && parseInt($(event).attr('data-hour')) == unpaddedstart.getHours() ) 
                    break;
            }
            if (found_between_event) {
                $('#gf-add-overlay #gf-warn').html('Room is booked between selected times.').show().fadeOut(5000);
                $('#gf-add-overlay #gf-end').find('option:selected').prop('selected',false);
                $('#gf-add-overlay #gf-end').find('option[data-hour=' + paddedstart.getHours() +'][value='+ paddedstart.getMinutes() +']').prop('selected',true);
            }
            
            // CHECK TIMES
            if (start >= end) {
                $('#gf-add-overlay #gf-warn').html('End time must be later than start time.').show().fadeOut(5000);
                $('#gf-add-overlay #gf-end').find('option:selected').prop('selected',false);
                $('#gf-add-overlay #gf-end').find('option[data-hour=' + paddedstart.getHours() +'][value='+ paddedstart.getMinutes() +']').prop('selected',true);
            }
        });
      
        // Submit Control
        $('#gf-submit').click(function(){
            if (!($(this).hasClass('invalid-email') || $(this).hasClass('invalid-title') || $(this).hasClass('invalid-word'))) {
                if (!self.submission_lock) {
                    self.submission_lock = true;
                    self.add_event_handler();
                    self.show_confirm_overlay();
                }
            }
        });
        
        // Cancel Control
        $('#gf-cancel').click(function(){
            self.hide_addevent_overlay();
        });
        
        // Confirm Control
        $('#gf-confirmed-overlay input[type="button"]').click(function(){
            self.hide_confirm_overlay();
            self.submission_lock = false;
        });
    },
    
    
    live_timeline : function() {
        var self = this;
        var div = $('<div>').attr('id','gf-timeline');
        $('#gf-events').append(div);
        self.timeline_bar(); // init;
        self.timeline_jump();
        setInterval(function(){
            self.timeline_bar();  // refresh 1 minute
        }, (60 * 1000));
        setInterval(function(){
            self.timeline_jump();  // refresh 10 minutes
        }, (10 * 60 * 1000));
        
    },
    
    timeline_jump : function() {
        var target = parseInt($('#gf-timeline').css('top').replace('px',''));
        $('#gf-events').scrollTop(target - this.timeline_top_space);
    },
    
    timeline_bar : function() {
        var now = new Date();
        var target = (this.row_height * (now.getHours() * 4)) + ((now.getMinutes()/15) * this.row_height);
        $('#gf-timeline').css('top', target + 'px');
        $('#gf-loaddrop').css('background-position', 'center ' + (target-50) + 'px');
    },
    
    
    validate_emails : function() {
    
        var regex = /^([a-zA-Z0-9_.+-])+\@uwosh.edu$/;
        
        $('#gf-email').blur(function(){
            var email = $(this).val().trim();
            if(regex.test(email)) {
                $('label[for="gf-email"]').removeClass('invalid-email-message');
                $(this).removeClass('invalid-field');
                $('#gf-submit').removeClass('invalid-email');
            
            }
            else if (email.length == 0){
                $(this).addClass('invalid-field').val('');
                $('#gf-submit').addClass('invalid-email');
            }
            else {
                $(this).addClass('invalid-field');
                $('label[for="gf-email"]').addClass('invalid-email-message');
                $('#gf-submit').addClass('invalid-email');
            }
        });
        
    },
    
    
    validate_titles : function() {
        $('#gf-title').on('keyup', function(){
            var banned_word_found = false;
            for(var i in GFBannedWords){
                var banned_word = GFBannedWords[i];
                if ($(this).val().indexOf(banned_word) != -1) {
                    banned_word_found = true
                    break
                }
            }
            if (banned_word_found){
                $('label[for="gf-title"]').addClass('invalid-wording-message');
                $('#gf-submit').addClass('invalid-word');
            }
            else {
                $('label[for="gf-title"]').removeClass('invalid-wording-message');
                $('#gf-submit').removeClass('invalid-word');
            }
        });
        
        $('#gf-title').blur(function(){
            var title = $(this).val().replace(/\s/g, '').replace(/\t/g, '');
            
            if (title.length == 0) {
                $(this).addClass('invalid-field');
                $('#gf-submit').addClass('invalid-title');
                $('label[for="gf-title"]').addClass('invalid-title-message');
            }
            else {
                $(this).removeClass('invalid-field');
                $('label[for="gf-title"]').removeClass('invalid-title-message');
                $('#gf-submit').removeClass('invalid-title');
            }

        });
        
    },
   
    
    fix_mobile_columns : function() {
        $('#gf-locations,#gf-events').show();

        var VisibleColumns = $('.gf-time-column:not(:hidden)').length;
        var Columns = {
            '1':'col-100',
            '2':'col-50',
            '3':'col-33',
            '4':'col-25',
            '5':'col-20',
            '6':'col-16',
        }

        $('.gf-time-column').removeClass('col-100 col-50 col-33 col-25 col-20 col-16');
        $('#gf-locations > div').removeClass('col-100 col-50 col-33 col-25 col-20 col-16');

        $('.gf-time-column').addClass(Columns[VisibleColumns]);
        $('#gf-locations > div').addClass(Columns[VisibleColumns]);
        
        if (VisibleColumns == 0){
            $('#gf-locations,#gf-events').hide();
            $('#gf-no-rooms').show();
        }
        else {
            $('#gf-no-rooms').hide();
        }
    },

    
    
}

$(document).ready(function(){
    GroupFinder.init();
    
    try{
        CampusLocation.OnChange(function(){
            GroupFinder.fix_mobile_columns();
        });
    } catch(e){}
});