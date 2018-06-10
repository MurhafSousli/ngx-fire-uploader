import { Directive, Input, Output, OnDestroy, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { Subject, zip, fromEvent } from 'rxjs';
import { tap, switchMap, filter } from 'rxjs/operators';

@Directive({
  selector: '[lazyImage]'
})
export class LazyImageDirective implements OnDestroy {

  // Lazy load worker
  private readonly _worker$ = new Subject();

  @Input('lazyImage')
  set lazyImage(imagePath) {
    this.loadImage(imagePath);
  }

  @Output() loading = new EventEmitter<boolean>();

  constructor(private _el: ElementRef, private _renderer: Renderer2) {
    const img = new Image();

    this._worker$.pipe(
      filter((imageSrc: string) => !!imageSrc),
      switchMap((imageSrc: string) => {

        // Image is loading
        this.loading.emit(true);

        // Stop previously loading
        img.src = imageSrc;

        // Image load success
        const loadSuccess = fromEvent(img, 'load').pipe(
          tap(() => {
            this._renderer.setStyle(this._el.nativeElement, 'backgroundImage', `url(${imageSrc})`);
            this.loading.emit(false);
          })
        );

        // Image load error
        const loadError = fromEvent(img, 'error').pipe(tap(() => this.loading.emit(false)));

        return zip(loadSuccess, loadError);
      })
    ).subscribe();
  }

  loadImage(imagePath) {
    this._worker$.next(imagePath);
  }

  ngOnDestroy() {
    this._worker$.complete();
  }
}
