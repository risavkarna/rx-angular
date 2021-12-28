import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { patch, toDictionary, update } from '@rx-angular/cdk/transformations';
import { defer, pairwise, ReplaySubject, Subject, switchMap } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ArrayProviderComponent } from '../../../../shared/debug-helper/value-provider/array-provider/array-provider.component';
import { TestItem } from '../../../../shared/debug-helper/value-provider/index';
import { RxVirtualForViewportComponent } from './virtual-for-viewport.component';

@Component({
  selector: 'rxa-virtual-for-test',
  template: `
    <div class="container">
      <div class="d-flex">
        <rxa-array-provider
          [unpatched]="[]"
          [buttons]="true"
        ></rxa-array-provider>
      </div>
      <div class="stats">
        <div *rxLet="data$; let data">
          <strong>Items: </strong>{{ data.length }}
        </div>
        <div *rxLet="renderedItems$; let renderedItems">
          <strong>renderedItems: </strong>{{ renderedItems }}
        </div>
      </div>
      <h2 class="mat-subheading-1">*rxVirtualFor</h2>
      <rxa-virtual-for-viewport class="viewport">
        <div
          *rxVirtualFor="
            let item of data$;
            let i = index;
            trackBy: trackItem;
            renderCallback: rendered
          "
          class="item"
        >
          {{ i }} {{ item.content }}
        </div>
      </rxa-virtual-for-viewport>
    </div>
  `,
  styles: [
    `
      :host {
      }
      .viewport {
        height: 350px;
      }
      .item {
        width: 250px;
        /*height: 50px;*/
        overflow: hidden;
        border: 1px solid green;
        padding: 10px 0;
        box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.13);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualForTestComponent implements OnInit, AfterViewInit {
  @ViewChild(ArrayProviderComponent)
  arrayProvider: ArrayProviderComponent;

  @ViewChild(RxVirtualForViewportComponent)
  virtualViewport: RxVirtualForViewportComponent;

  private readonly afterViewInit$ = new ReplaySubject<void>(1);

  contentCache = {};

  rendered = new Subject<unknown>();
  renderedItems$ = this.rendered.pipe(
    map(
      () => this.virtualViewport.nativeElement.querySelectorAll('.item').length
    )
  );

  data$ = defer(() =>
    this.afterViewInit$.pipe(
      switchMap(() =>
        this.arrayProvider.array$.pipe(
          map((values) =>
            values.map((item) => {
              let content = this.contentCache[item.id];
              if (!content) {
                content = this.randomContent();
                this.contentCache[item.id] = content;
              }
              return {
                ...item,
                content,
              };
            })
          )
        )
      )
    )
  );

  randomContent = () => {
    return new Array(Math.max(1, Math.floor(Math.random() * 25)))
      .fill('')
      .map(() => this.randomWord())
      .join(' ');
  };

  randomWord = () => {
    const words = [
      'Apple',
      'Banana',
      'The',
      'Orange',
      'House',
      'Boat',
      'Lake',
      'Car',
      'And',
    ];
    return words[Math.floor(Math.random() * words.length)];
  };

  trackItem = (idx: number, item: TestItem): number => item.id;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.afterViewInit$.next();
  }
}
