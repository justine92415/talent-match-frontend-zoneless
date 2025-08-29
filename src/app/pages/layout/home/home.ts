import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SectionTitle } from '@components/section-title/section-title';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import { ReviewCard, ReviewData } from '@components/review-card/review-card';
import { SwiperWapper, SwiperConfig } from '@components/swiper-wapper/swiper-wapper';
import { TmfIconEnum } from '@share/icon.enum';

@Component({
  selector: 'tmf-home',
  imports: [SectionTitle, VideoCard, CourseCard, ReviewCard, SwiperWapper, MatIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styles: ``
})
export default class Home {
  // Swiper configurations
  videoSwiperConfig: SwiperConfig = {
    slidesPerView: 4,
    spaceBetween: 24,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    }
  };

  courseSwiperConfig: SwiperConfig = {
    slidesPerView: 4,
    spaceBetween: 24,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      640: {
        slidesPerView: 1.2,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
      1536: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    }
  };

  // Math object for template use
  Math = Math;

  videos: VideoCardData[] = [
    {
      imageSrc: '/assets/images/reel_cooking_1.jpg',
      imageAlt: '烹飪教學影片',
      tag: '烹飪料理',
      description: '只要五分鐘，讓您彷彿擁有專業主廚的刀工！',
      isPlaying: true
    },
    {
      imageSrc: '/assets/images/reel_art_1.jpg',
      imageAlt: '藝術創作影片',
      tag: '藝術創作',
      description: '放鬆身體，一切感官交給畫筆，帶領我們走向心海',
      isPlaying: false
    },
    {
      imageSrc: '/assets/images/reel_cooking_2.jpg',
      imageAlt: '甜點教學影片',
      tag: '烹飪料理',
      description: '只要學會杯子蛋糕，任何甜點都難不了你，還在等什麼呢？',
      isPlaying: false
    },
    {
      imageSrc: '/assets/images/reel_finance.jpg',
      imageAlt: '理財投資影片',
      tag: '理財投資',
      description: '存股加碼 009*0，月領 3 萬不是夢，讓大師來解密如何做好資產配置',
      isPlaying: false
    },
    {
      imageSrc: '/assets/images/reel_cooking_3.jpg',
      imageAlt: '泡麵教學影片',
      tag: '烹飪料理',
      description: '好驚人～～～教你如何煮出Q彈好吃的泡麵！',
      isPlaying: false
    }
  ];

  courses: CourseCardData[] = [
    {
      id: 'course-1',
      title: '從零開始學吉他：初學者入門指南',
      description: '想要學習彈奏吉他嗎？這門課程專為初學者而設，無論你是完全沒有音樂背景還是有些基礎但想要加強技巧，都適合參加。在這門課程中,你將從最基本的吉他知識開始,逐步學習如何正確握持吉他、彈奏基本和弦......',
      imageSrc: '/assets/images/reel_art_1.jpg',
      level: '新手班',
      category: '音樂－吉他',
      price: 1200,
      teacher: {
        name: 'Eric Clapton',
        avatar: '/assets/images/teacher-avatar-1.jpg'
      },
      rating: {
        score: 5.0,
        count: 23
      }
    },
    {
      id: 'course-2',
      title: '細針縫夢：手作裁縫入門',
      description: '無論您是對裁縫有濃厚興趣，還是想要學習一技之長，這門課程都將是您的理想選擇。在這個由專業裁縫師親自指導的課程中，您將從基礎開始，逐步學習裁剪、縫紉和製作各種服裝和布藝作品所需的技能和知識。',
      imageSrc: '/assets/images/reel_cooking_1.jpg',
      level: '新手班',
      category: '手工藝－裁縫',
      price: 770,
      teacher: {
        name: '王太郎',
        avatar: '/assets/images/teacher-avatar-2.jpg'
      },
      rating: {
        score: 4.5,
        count: 12
      }
    },
    {
      id: 'course-3',
      title: '饗宴廚藝：美食烹飪工作坊',
      description: '我是文文，你們的烹飪大師！非常榮幸能夠與你們分享我的烹飪熱情和廚藝技巧。從我學習烹飪的那一刻起，我就深深著迷於美食的世界,並一直在不斷地探索和創新。無論是烤、煮、炸還是蒸,每一.....',
      imageSrc: '/assets/images/reel_cooking_2.jpg',
      level: '高手班',
      category: '烹飪－西式',
      price: 1200,
      teacher: {
        name: '文文',
        avatar: '/assets/images/teacher-avatar-3.jpg'
      },
      rating: {
        score: 4.0,
        count: 333
      }
    },
    {
      id: 'course-4',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      description: '我專業且有耐心，致力於幫助學生掌握鋼琴演奏技巧，同時注重培養他們的音樂感和表達能力。',
      imageSrc: '/assets/images/reel_art_1.jpg',
      level: '大師班',
      category: '音樂－鋼琴',
      price: 600,
      teacher: {
        name: '齊齊cy',
        avatar: '/assets/images/teacher-avatar-4.jpg'
      },
      rating: {
        score: 4.5,
        count: 100
      }
    },
    {
      id: 'course-5',
      title: '下班晚餐吃什麼？教你快出做出一道菜',
      description: '美味料理的速成指南，千萬別錯過\n教你如何先備料，以及做菜的順序。\n擺脫手忙腳亂的狀況！',
      imageSrc: '/assets/images/reel_cooking_3.jpg',
      level: '新手班',
      category: '烹飪－中式',
      price: 600,
      teacher: {
        name: '林雯',
        avatar: '/assets/images/teacher-avatar-5.jpg'
      },
      rating: {
        score: 4.5,
        count: 500
      }
    },
    {
      id: 'course-6',
      title: '居家理財：小資族投資入門',
      description: '從零基礎開始學習投資理財，教你如何有效管理個人財務，建立長期投資計畫。適合剛入社會的新鮮人以及想要開始理財的小資族。',
      imageSrc: '/assets/images/reel_finance.jpg',
      level: '新手班',
      category: '理財投資',
      price: 900,
      teacher: {
        name: '張經理',
        avatar: '/assets/images/teacher-avatar-6.jpg'
      },
      rating: {
        score: 4.8,
        count: 156
      }
    }
  ];

  reviews: ReviewData[] = [
    {
      id: 'review-1',
      name: 'Eric Clapton',
      date: '2023-08-09',
      title: '可以一展長才的平台',
      content: '可以認識不同領域的高手，並且把喜歡的領域做推廣，是一件開心的事。',
      rating: 5,
      avatar: '/assets/images/teacher-avatar-1.jpg'
    },
    {
      id: 'review-2',
      name: 'Ray Chen',
      date: '2024-01-01',
      title: '清楚明白！值得購買的優秀課程',
      content: '豐富的範例，精細的解說，尤其老師不嫌麻煩線上回答，很有用且精實，沒太多廢話。雖然課程時間不長，但每個都是精華，需要反覆思考！',
      rating: 4,
      avatar: '/assets/images/teacher-avatar-2.jpg'
    },
    {
      id: 'review-3',
      name: '齊齊cy',
      date: '2024-05-20',
      title: '非常感謝有一個平台來分享所知所學',
      content: '感謝爸媽栽培，讓我可以把喜愛的料理帶給更多人，只想說：『媽 我在這裡～』',
      rating: 5,
      avatar: '/assets/images/teacher-avatar-3.jpg'
    },
    {
      id: 'review-4',
      name: 'Gill Wuuuu',
      date: '2024-01-01',
      title: '自從開始使用後，考試都考100分',
      content: '老師非常溫柔，即使是小白，老師都非常願意不厭其煩的指導，讚讚～',
      rating: 5,
      avatar: '/assets/images/teacher-avatar-4.jpg'
    },
    {
      id: 'review-5',
      name: 'Pin',
      date: '2023-12-03',
      title: '非常紮實的設計練習',
      content: '課程的架構就如老師介紹時所說，由淺入深，示範和舉例都不會很難，跟著一起練習就很容易上手。還有一步步教你從頭設計一套新的版型，真的非常實用！',
      rating: 4.5,
      avatar: '/assets/images/teacher-avatar-5.jpg'
    },
    {
      id: 'review-6',
      name: '林雯',
      date: '2024-04-04',
      title: '推薦給攝影新手',
      content: '老師上課很淺顯易懂、每一個章節都短短的、看起來很輕鬆、講解也非常清晰',
      rating: 5,
      avatar: '/assets/images/teacher-avatar-6.jpg'
    }
  ];

  get TmfIcon() {
    return TmfIconEnum;
  }
}
