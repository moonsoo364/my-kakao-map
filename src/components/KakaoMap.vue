<template>
  <div>
    <select v-model="level" @change="updateLevel">
      <option v-for="l in levels" :key="l" :value="l">Level {{ l }}</option>
    </select>
    <div id="map" ref="mapArea" style="width:100%; height:400px;"></div>
    <!-- 주소 표시 영역 -->
    <div style="margin-top:10px;">
      <div>도로명 주소: {{ roadAddress }}</div>
      <div>지번 주소: {{ address }}</div>
    </div>
  </div>
</template>

<script>
import startImg from '@/assets/map/ic-marker-user.png';
import endImg from '@/assets/map/ic-marker-store.png';

export default {
  name: 'KakaoMap',
  data() {
    return {
      appKey: process.env.VUE_APP_API_KEY,
      startPos: {// 서울 시청 좌표 
        latitude: 37.56669807755658,
        longitude: 126.97873152807972
      },
      endPos: {// 영등포 구청 좌표
        latitude: 37.52638881144293,
        longitude: 126.8962885955753
      },
      map: null, 
      level: 3,          
      levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      startMarker: null,
      endMarker: null,
      address: '',        // 지번 주소
      roadAddress: '',    // 도로명 주소
      startLatLng: {},
      endLatLng: {},
      init: {
        level: 4,
        bounds: null,
        mapCenter: null
      },
      isDragEnd: false
    };
  },
  mounted() {
    this.loadMapScript();
  },
  methods: {
    // 지도 설정
      setMap () {
        // 초기 진입한 영역을 축소 level의 최소값으로 지정
        const initLevel = this.map.getLevel()
        // 줌아웃
        const mapEvent = window.kakao.maps.event
        this.mapEvent = mapEvent
        const setZoomLimitOnce = () => {
          // this.map.setMaxBounds(bounds)
          mapEvent.addListener(this.map, 'zoom_changed', () => {
            // console.log('## zoom_changed')
            if (this.map.getLevel() > initLevel && !this.isDragEnd) {
              console.log('## 초기 레벨 초과, 원래 위치로 이동')
              // this.map.setLevel(initLevel)
              this.map.setBounds(this.init.bounds)
            }
          })
          mapEvent.removeListener(this.map, 'idle', setZoomLimitOnce)
        }
        mapEvent.addListener(this.map, 'idle', setZoomLimitOnce)

        mapEvent.addListener(this.map, 'dragend', () => {
          console.log('드래그 종료')
          const center = this.map.getCenter()
          if (!this.init.bounds.contain(center)) {
            console.log('초기 영역을 벗어남 → 원래 위치로 이동')
            /**
             * 초기 영역 벗어나고 setBounds 호출 되면 zoom_changed 이벤트가 발생하면서
             * boundUserBetweenStore가 발생하면서 setBounds를 2번 호출함 이를 방지하기 위해
             * isDragEnd 변수로 zoom_changed 이벤트 동작을 토글한다.
             * */
            this.isDragEnd = true
            this.map.setBounds(this.init.bounds)
            this.isDragEnd = false
          }
        })
      },
      async loadMapScript () {
        await new Promise((resolve, reject) => {
          let script = document.getElementById(this.scriptId)
          if (script) {
            script.parentNode.removeChild(script)
          }
          script = document.createElement('script')
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.appKey}&autoload=false&libraries=services`
          script.async = true
          script.id = this.scriptId

          script.onload = () => resolve()
          script.onerror = (err) => {
            console.log(err)
            reject(new Error('Kakao Map SDK load failed'))
          }

          document.head.appendChild(script)
      })
      // autoload = false 일 때 명시적으로 로드 실행
      window.kakao.maps.load(() => {
        this.loadMap()
      })
    },
    //초기 지도 로드 메서드
    loadMap() {
      const container = this.$refs.mapArea;
      this.startLatLng = this.setLatLng(this.startPos)
      this.endLatLng = this.setLatLng(this.endPos)

      const options = {
        center: this.startLatLng,
        level: this.level
      };

      this.map = new window.kakao.maps.Map(container, options);
      this.markStart();
      this.markEnd();

      this.boundStartToEnd();
      this.init.level = this.map.getLevel()
      this.init.bounds = this.map.getBounds()
      this.init.mapCenter = this.map.getCenter()

      this.getAddressFromCoords();
      this.setMap()
    },
     // 카카오 맵에서 타깃 표시
    markTarget (target) {
      if (target.marker) {
        target.marker.setMap(null)
      }

      const imageSrc = target.image
      const imageSize = new window.kakao.maps.Size(58, 70)
      const imageOption = { offset: new window.kakao.maps.Point(29, 70) } // 가로 절반(29), 세로 끝(70)

      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)
      target.marker = new window.kakao.maps.Marker({
        map: this.map,
        position: target.position,
        image: markerImage
      })
    },
    // 시작 위치 이미지로 마커 표시
    markStart(){
      const target = {
        marker: this.startMarker,
        position: this.startLatLng,
        image: startImg
      }
      this.markTarget(target)
      // this.map.setCenter(this.startLatLng);
    },
    // 종료 위치 이미지로 마커 표시
    markEnd (){
      const target = {
        marker: this.endMarker,
        position: this.endLatLng,
        image: endImg
      }
      this.markTarget(target)
      // this.map.setCenter(this.endLatLng);
    },
    //현재 주소 정보 가져오기
    getAddressFromCoords() {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(this.startLatLng.getLng(), this.startLatLng.getLat(), (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const roadAddr = result[0].road_address;
          const addr = result[0].address;
          this.roadAddress = roadAddr ? roadAddr.address_name : '도로명 주소가 없습니다.';
          this.address = addr ? addr.address_name : '지번 주소가 없습니다.';
          // console.log('도로명 주소:', roadAddr);
          // console.log('지번 주소:', addr);
        }
      });
    },
    //카카오 기본 마커
    markPoint(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            position;
            // const lat = position.coords.latitude;
            // const lng = position.coords.longitude;
            const lat = this.startPos.latitude;
            const lng = this.startPos.longitude;
            const locPosition = new window.kakao.maps.LatLng(lat, lng);

            const marker = new window.kakao.maps.Marker({
              map: this.map,
              position: locPosition
            });

            const infowindow = new window.kakao.maps.InfoWindow({
              content: '<div style="padding:5px;">현재 위치</div>',
              removable: true
            });
            infowindow.open(this.map, marker);
            this.map.setCenter(locPosition);
          },
          () => {
            console.log('위치 정보를 가져올 수 없습니다.');
          }
        );
      }
    },
    // 시작 위치와 종료 위치 마커 표시
    boundStartToEnd () {
      const bounds = new window.kakao.maps.LatLngBounds()
      bounds.extend(this.startLatLng)
      bounds.extend(this.endLatLng)
      this.map.setBounds(bounds)
    },
    // 위, 경도 값으로 로 카카오 맵 위경도 객체 생성
    setLatLng(latLat) {
      return new window.kakao.maps.LatLng(latLat.latitude, latLat.longitude);
    },
        //지도 축적 단계별로 변경
    updateLevel() {
      if (this.map) {
        this.map.setLevel(this.level);
      }
    },
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
select {
  font-size: 16px;
  padding: 4px;
}
</style>
