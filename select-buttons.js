

(function($) {
	
	var defaults = {
		separator: ',',
		multiple: false,
		noEmpty: false,
		options: [],
		selectedIndexes: [],
		disabledIndexes: [],
		disabledValues: [],
		skipValues: [],
		
		// callbacks
		onchange: null,
		onselect: null,
		onunselect: null
	};
	
	var selectButtons = {
		/**
		 * 
		 */
		init: function() {
			var $this = $(this), settings = $this.data('sbOptions'), holder = $('<span class="select-buttons" />');
			
			// montando a partir de um SELECT
			if((!settings.options instanceof Array || !settings.options.length) && $this.is('select')) {
				settings.options = selectButtons._optionsFromSelect(this);
				settings.multiple = !!$this.attr('multiple');
				settings.noEmpty = false;//settings.noEmpty === false ? false : true;
				$this.data('sbOptions', settings);
			}
			
			// salvamos o obj de configuração
			holder.data('sbOptions', $.extend({element: this}, settings));
			
			// apendamos o novo elemento
			$this.hide().after(holder);
			
			// criando as options (botões)
			for(var i in settings.options) {
				if($.isPlainObject(settings.options[i])) {
					var val = settings.options[i].value, label = settings.options[i].label, 
					    checked = !!settings.options[i].checked, 
					    disabled = !!settings.options[i].disabled, 
					    title;
					if(settings.options[i].title !== undefined) title = settings.options[i].title;
				} else {
					var val = settings.options[i], label = /[^0-9]/.test(i) ? i : val, checked = false, title;
				}
				
				// só continuamos se houver valor
				if(!(val && label)) continue;
				// e se não é um valor que está em skipValues 
				if($.inArray(val, settings.skipValues) >= 0) continue;
				
				var element = $('<a href="javascript://" data-value="' + val + '" class="button">' + label + '</a>');
				if(title) element.attr('title', title);
				if(checked) element.addClass('checked');
				if(disabled) element.addClass('disabled');
				
				element.click(function(e) {
					var button = $(this), value = button.attr('data-value'), checked = button.is('.checked'), 
					    holder = button.parents('.select-buttons'), settings = holder.data('sbOptions');
					
					// não mexer em botões desailitados
					if(button.is('.disabled')) return false;
										
					// comportamentos
					if(!settings.multiple) {
						if(checked) {
							if(!settings.noEmpty || $(settings.element).selectButtons('getValue').length > 1) {
								holder.find('.button').removeClass('checked');
								selectButtons.callback.call($this, 'onunselect', this);
								selectButtons.callback.call($this, 'onchange', false, this);
							}
						} else {
							holder.find('.button').removeClass('checked');
							button.addClass('checked');
							selectButtons.callback.call($this, 'onselect', this);
							selectButtons.callback.call($this, 'onchange', true, this);
						}
					} else {
						if(checked) {
							if(!settings.noEmpty || $(settings.element).selectButtons('getValue').length > 1) {
								button.removeClass('checked');
								selectButtons.callback.call($this, 'onunselect', this);
								selectButtons.callback.call($this, 'onchange', false, this);
							}
						} else {
							button.addClass('checked');
							selectButtons.callback.call($this, 'onselect', this);
							selectButtons.callback.call($this, 'onchange', true, this);
						}
					}
					$(settings.element).selectButtons('update');
				});
				holder.append(element);
			}
			
			if(settings.selectedIndexes.length || settings.disabledIndexes.length || settings.disabledValues.length) {
				holder.find('.button').each(function(index, element) {
					if($.inArray(index, settings.selectedIndexes) >= 0 && !$(element).is('.checked')) {
						$(element).addClass('checked');
					}

					if($.inArray(index, settings.disabledIndexes) >= 0 && !$(element).is('.disabled') ||
					   $.inArray($(element).attr('data-value'), settings.disabledValues) >= 0 && !$(element).is('.disabled')) {
						$(element).addClass('disabled');
					}
				});
			}

			selectButtons.update.call(this);
		},
		
		callback: function(evt) {
			var sb = selectButtons._getInfo(this);
			if(typeof sb.settings[evt] == 'function') {
				sb.settings[evt].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		},
		
		checkAll: function() {
			var sb = selectButtons._getInfo(this);
			$('.button', sb.holder).not('.disabled').addClass('checked');
			selectButtons.update.call(this);
		},
		
		uncheckAll: function() {
			var sb = selectButtons._getInfo(this);
			$('.button', sb.holder).removeClass('checked');
			selectButtons.update.call(this);
		},
		
		invert: function() {
			var sb = selectButtons._getInfo(this);
			sb.holder.find('.button').each(function(index, element) {
				var $this = $(element);
				if($this.is('.disabled')) return true; // skip
				if($this.is('.checked')) {
					$this.removeClass('checked');
				} else {
					$this.addClass('checked');
				}
			});
			selectButtons.update.call(this);
		},
		
		check: function(value) {
			var sb = selectButtons._getInfo(this), button = selectButtons._getButtonByValueOrIndex(sb, value);
			if(button.length) {
				if(!sb.settings.multiple) {
					$('.button.checked', sb.holder).removeClass('checked');
				}
				button.addClass('checked');
			}
			selectButtons.update.call(this);
		},
		
		uncheck: function(value) {
			var sb = selectButtons._getInfo(this), button = selectButtons._getButtonByValueOrIndex(sb, value), buttons = $('.button.checked', sb.holder);
			if(sb.settings.multiple && sb.settings.noEmpty && buttons.length == 1) {
				return;
			}
			if(button.length) button.removeClass('checked');
			selectButtons.update.call(this);
		},
		
		enable: function(value) {
			var sb = selectButtons._getInfo(this), button = selectButtons._getButtonByValueOrIndex(sb, value);
			if(button.length) button.removeClass('disabled');
		},
		
		disable: function(value, uncheck) {
			var sb = selectButtons._getInfo(this), button = selectButtons._getButtonByValueOrIndex(sb, value);
			if(button.length) {
				button.addClass('disabled');
				if(uncheck) button.removeClass('checked');
			}
		},
		
		update: function() {
			var sb = selectButtons._getInfo(this), indexes = [];
			sb.holder.find('.button').each(function(index, element) {
				if($(element).is('.checked')) {
					indexes.push(index);
				}
			});
			sb.holder.attr('data-selectedIndexes', indexes.join(','));
			
			var form = sb.element.parents('form');
			if(form.length) {
				$('.select-buttons', form).each(function(index, element) {
					var holder = $(this), settings = holder.data('sbOptions'), input = $(settings.element);
					var values = input.selectButtons('getValue');
					var tagname = input.prop('tagName').toLowerCase();
					switch(tagname) {
						case 'select':
							input.find('option').each(function(index, element) {
								if($.inArray(this.value, values) >= 0) {
									this.selected = true;
								} else {
									this.selected = false;
								}
							});
						break;
						case 'input':
							input.val(values instanceof Array ? values.join(settings.separator) : values);
						break;
					}
				});
			}
		},
		
		getValue: function(index) {
			var sb = selectButtons._getInfo(this);
			if(index === undefined) {
				var ret = selectButtons._getValues(this);
				return ret;
			}
			try { return sb.holder.find('.button').eq(index).attr('data-value'); }
			catch(e) { return null; }		
		},
		
		_getInfo: function(obj) {
			var $obj = $(obj), ret = {holder: $obj.siblings('.select-buttons'), settings: $obj.data('sbOptions'), element: $obj};
			ret.settings.element = $obj;
			return ret;
		},
		
		_getButtonByValueOrIndex: function(sb, value) {
			if(typeof value == 'number') {
				var button = sb.holder.find('.button:nth-child(' + (value + 1) + ')');
			} else {
				var button = sb.holder.find('.button[data-value="' + value + '"]');
			}
			return button;
		},
		
		_getValues: function(elem) {
			var sb = selectButtons._getInfo(elem), values = [];
			sb.holder.find('.button.checked').each(function(index, element) {
				values.push($(element).attr('data-value'));
			});
			return values;
		},
		
		_optionsFromSelect: function(sel) {
			var opts = [];
			$('option', sel).each(function(index, element) {
				var obj = {};
				obj.label = element.innerHTML;
				obj.value = element.value || obj.label;
				obj.checked = !!element.selected;
				obj.disabled = !!element.disabled;
				if(element.title) obj.title = element.title;
				opts.push(obj);
			});
			return opts;
		}
	};
	
	$.fn.selectButtons = function(opts) {
		if(typeof opts == 'string') {
			if(typeof selectButtons[opts] == 'function') {
				if(opts.substr(0,1) == '_') {
					$.error("Call to private method 'selectButtons." + opts + "' directly.");
				}
				var ret = selectButtons[opts].apply(this, Array.prototype.slice.call(arguments, 1));
				if(ret !== undefined) return ret;
			} else {
				$.error("The method 'selectButtons." + opts + "' does not exists.");
			}
			return this;
		}
		
		var options = $.extend({}, defaults, opts || {}), $this = $(this);
		if($this.is('select')) {
			options.multiple = !!$this.attr('multiple');
		}
		$this.data('sbOptions', options);
		selectButtons.init.call(this);
		return this;
	};
	
})(jQuery);


