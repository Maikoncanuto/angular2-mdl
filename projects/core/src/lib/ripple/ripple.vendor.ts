/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* istanbul ignore file */
'use strict';

/**
 * Class constructor for Ripple MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 */
export function MaterialRipple(renderer, element) {
  this.renderer_ = renderer;
  this.element_ = element;

  // Initialize instance.
  this.init();
}


/**
 * Store constants in one place so they can be updated easily.
 */
MaterialRipple.prototype.Constant_ = {
  INITIAL_SCALE: 'scale(0.0001, 0.0001)',
  INITIAL_SIZE: '1px',
  INITIAL_OPACITY: '0.4',
  FINAL_OPACITY: '0',
  FINAL_SCALE: ''
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 */
MaterialRipple.prototype.CssClasses_ = {
  RIPPLE_CENTER: 'mdl-ripple--center',
  RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
  RIPPLE: 'mdl-ripple',
  IS_ANIMATING: 'is-animating',
  IS_VISIBLE: 'is-visible'
};

/**
 * Handle mouse / finger down on element.
 *
 */
// tslint:disable-next-line
MaterialRipple.prototype.downHandler_ = function (event) {
  if (!this.rippleElement_.style.width && !this.rippleElement_.style.height) {
    const rect = this.element_.getBoundingClientRect();
    this.boundHeight = rect.height;
    this.boundWidth = rect.width;
    this.rippleSize_ = Math.sqrt(rect.width * rect.width +
      rect.height * rect.height) * 2 + 2;
    this.rippleElement_.style.width = this.rippleSize_ + 'px';
    this.rippleElement_.style.height = this.rippleSize_ + 'px';
  }

  this.renderer_.addClass(this.rippleElement_, this.CssClasses_.IS_VISIBLE);

  if (event.type === 'mousedown' && this.ignoringMouseDown_) {
    this.ignoringMouseDown_ = false;
  } else {
    if (event.type === 'touchstart') {
      this.ignoringMouseDown_ = true;
    }
    const frameCount = this.getFrameCount();
    if (frameCount > 0) {
      return;
    }
    this.setFrameCount(1);
    const bound = event.currentTarget.getBoundingClientRect();
    let x;
    let y;
    // Check if we are handling a keyboard click.
    if (event.clientX === 0 && event.clientY === 0) {
      x = Math.round(bound.width / 2);
      y = Math.round(bound.height / 2);
    } else {
      const clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
      const clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
      x = Math.round(clientX - bound.left);
      y = Math.round(clientY - bound.top);
    }
    this.setRippleXY(x, y);
    this.setRippleStyles(true);
    window.requestAnimationFrame(this.animFrameHandler.bind(this));
  }
};

/**
 * Handle mouse / finger up on element.
 *
 */
// tslint:disable-next-line
MaterialRipple.prototype.upHandler_ = function (event) {
  // Don't fire for the artificial "mouseup" generated by a double-click.
  if (event && event.detail !== 2) {
    // Allow a repaint to occur before removing this class, so the animation
    // shows for tap events, which seem to trigger a mouseup too soon after
    // mousedown.
    // tslint:disable-next-line
    setTimeout(function () {
      this.renderer_.removeClass(this.rippleElement_, this.CssClasses_.IS_VISIBLE);
    }.bind(this), 0);
  }
};

/**
 * Initialize element.
 */
// tslint:disable-next-line
MaterialRipple.prototype.init = function () {
  if (this.element_) {
    const recentering =
      this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER);
    if (!this.element_.classList.contains(
      this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)) {
      this.rippleElement_ = this.element_.querySelector('.' +
        this.CssClasses_.RIPPLE);
      this.frameCount_ = 0;
      this.rippleSize_ = 0;
      this.x_ = 0;
      this.y_ = 0;

      // Touch start produces a compat mouse down event, which would cause a
      // second ripples. To avoid that, we use this property to ignore the first
      // mouse down after a touch start.
      this.ignoringMouseDown_ = false;

      this.boundDownHandler = this.downHandler_.bind(this);
      this.element_.addEventListener('mousedown', this.boundDownHandler);
      this.element_.addEventListener('touchstart', this.boundDownHandler);

      this.boundUpHandler = this.upHandler_.bind(this);
      this.element_.addEventListener('mouseup', this.boundUpHandler);
      this.element_.addEventListener('mouseleave', this.boundUpHandler);
      this.element_.addEventListener('touchend', this.boundUpHandler);
      this.element_.addEventListener('blur', this.boundUpHandler);


      // tslint:disable-next-line
      this.getFrameCount = function () {
        return this.frameCount_;
      };

      // tslint:disable-next-line
      this.setFrameCount = function (fC) {
        this.frameCount_ = fC;
      };

      // tslint:disable-next-line
      this.getRippleElement = function () {
        return this.rippleElement_;
      };

      // tslint:disable-next-line
      this.setRippleXY = function (newX, newY) {
        this.x_ = newX;
        this.y_ = newY;
      };


      // tslint:disable-next-line
      this.setRippleStyles = function (start) {
        if (this.rippleElement_ !== null) {
          let transformString;
          let scale;
          let size;
          let offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';

          if (start) {
            scale = this.Constant_.INITIAL_SCALE;
            size = this.Constant_.INITIAL_SIZE;
          } else {
            scale = this.Constant_.FINAL_SCALE;
            size = this.rippleSize_ + 'px';
            if (recentering) {
              offset = 'translate(' + this.boundWidth / 2 + 'px, ' +
                this.boundHeight / 2 + 'px)';
            }
          }

          transformString = 'translate(-50%, -50%) ' + offset + scale;

          this.rippleElement_.style.webkitTransform = transformString;
          this.rippleElement_.style.msTransform = transformString;
          this.rippleElement_.style.transform = transformString;

          if (start) {
            this.renderer_.removeClass(this.rippleElement_, this.CssClasses_.IS_ANIMATING);
          } else {
            this.renderer_.addClass(this.rippleElement_, this.CssClasses_.IS_ANIMATING);
          }

        }
      };

      /**
       * Handles an animation frame.
       */
      // tslint:disable-next-line
      this.animFrameHandler = function () {
        if (this.frameCount_-- > 0) {
          window.requestAnimationFrame(this.animFrameHandler.bind(this));
        } else {
          this.setRippleStyles(false);
        }
      };
    }
  }
};

